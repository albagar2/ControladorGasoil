import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo después de 15 minutos.'
    }
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Demasiados intentos de acceso desde esta IP, por favor inténtalo de nuevo después de una hora.'
    }
});
