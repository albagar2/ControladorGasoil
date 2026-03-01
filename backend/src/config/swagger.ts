import { Express } from 'express';

const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: '⛽ Control de Gasoil Familiar API',
        version: '1.0.0',
        description: '📘 **Documentación Oficial**\n\nBienvenido a la API del sistema de control de gasoil familiar. Esta aplicación permite gestionar de manera centralizada la flota de vehículos, registrar repostajes, y planificar mantenimientos, asignando distintos conductores a cada operación.\n\n### 🔐 Autenticación\nTodos los endpoints requieren autenticación (excepto Login y Registro). Obtén tu Token JWT en el endpoint de Login y autorízate usando el botón "Authorize" en la esquina superior derecha.',
        contact: {
            name: 'Soporte Técnico',
            email: 'admin@example.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Servidor de Desarrollo Local',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Introduce tu token JWT aquí (sin la palabra Bearer)'
            },
        },
    },
    paths: {
        '/api/auth/login': {
            post: {
                tags: ['Autenticación'],
                summary: 'Iniciar Sesión (Login)',
                description: 'Introduce tus credenciales para obtener un Token JWT válido por 1 hora.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', example: 'admin@example.com' },
                                    password: { type: 'string', example: '123456' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Login exitoso. Devuelve token JWT y datos del usuario.' },
                    401: { description: 'Credenciales inválidas.' },
                },
            },
        },
        '/api/vehicles': {
            get: {
                tags: ['Vehículos'],
                summary: 'Listar Vehículos',
                description: 'Obtiene la lista completa de vehículos asociados a la familia del usuario autenticado.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de vehículos obtenida correctamente.' },
                    401: { description: 'No autorizado (Token faltante o expirado).' },
                },
            },
        },
        '/api/drivers': {
            get: {
                tags: ['Conductores'],
                summary: 'Listar Conductores',
                description: 'Obtiene todos los conductores registrados en la plataforma familiar.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de conductores obtenida correctamente.' },
                    401: { description: 'No autorizado.' },
                },
            },
        },
        '/api/refuels': {
            get: {
                tags: ['Repostajes'],
                summary: 'Historial de Repostajes',
                description: 'Consulta todos los registros de consumo de combustible, incluyendo ubicación, precio, total y conductor asociado.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de repostajes obtenida exitosamente.' },
                    401: { description: 'No autorizado.' },
                },
            },
        },
        '/api/maintenances': {
            get: {
                tags: ['Mantenimientos'],
                summary: 'Historial de Mantenimientos',
                description: 'Consulta los mantenimientos realizados (ITV, reparaciones, revisiones) para todos los vehículos.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de mantenimientos obtenida.' },
                    401: { description: 'No autorizado.' },
                },
            },
        },
    },
};

const customCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info { margin: 30px 0; padding: 20px; border-radius: 12px; }
  .swagger-ui .info .title { font-family: 'Inter', sans-serif; font-weight: 700; }
  .swagger-ui .info p { font-size: 15px; line-height: 1.6; }
  .swagger-ui .opblock .opblock-summary-method { border-radius: 6px; font-weight: 600; padding: 6px 15px; }
  .swagger-ui .btn.authorize { background-color: #10b981; border-color: #10b981; color: white; border-radius: 8px; font-weight: bold; }
  .swagger-ui .btn.authorize svg { fill: white; }
  .swagger-ui .opblock.opblock-post { border-color: #4f46e5; background: rgba(79, 70, 229, 0.05); }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #4f46e5; }
  .swagger-ui .opblock.opblock-get { border-color: #0ea5e9; background: rgba(14, 165, 233, 0.05); }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #0ea5e9; }
  .swagger-ui section.models { border: 1px solid #e2e8f0; border-radius: 12px; }
`;

export const setupSwagger = (app: Express) => {
    app.get('/api-docs', (req, res) => {
        res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Documentación API | Garaje</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css" />
        <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@latest/favicon-32x32.png" sizes="32x32" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; font-family: 'Inter', sans-serif; }
          
          /* Auto Dark Mode for Swagger UI using CSS filter inversion */
          @media (prefers-color-scheme: dark) {
            body { background: #121212; }
            .swagger-ui { filter: invert(90%) hue-rotate(180deg); }
            /* Prevent double inversion of images or code blocks if necessary */
            .swagger-ui .highlight-code { filter: invert(100%) hue-rotate(180deg); }
          }
          ${customCss}
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.js" charset="UTF-8"> </script>
        <script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
        <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerSpec)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          });
          window.ui = ui;
        };
      </script>
      </body>
      </html>
    `);
    });
    console.log('Swagger UI available at http://localhost:3001/api-docs (Custom Themed)');
};
