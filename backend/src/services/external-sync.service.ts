import dotenv from 'dotenv';

dotenv.config();

export class ExternalSyncService {
  private static apiUrl = process.env.GASTOS_FAMILIARES_API;
  private static syncKey = process.env.INTERNAL_SYNC_KEY;

  static async syncExpense(data: {
    amount: number;
    description: string;
    category: string;
    userId: string | number;
    familyId: string | number;
    date: Date;
    propertyId?: string;
    paymentMethodId?: string;
  }) {
    if (!this.apiUrl || !this.syncKey) {
      console.log('⚠️ External Sync not configured. Skipping.');
      return;
    }

    // Usar IDs por defecto si están configurados en el .env
    const finalUserId = process.env.SYNC_DEFAULT_USER_ID || data.userId.toString();
    const finalFamilyId = process.env.SYNC_DEFAULT_FAMILY_ID || data.familyId.toString();

    try {
      console.log(`🔄 Syncing expense to GastosFamiliares: ${data.description}...`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-sync-key': this.syncKey
        },
        body: JSON.stringify({
          ...data,
          userId: finalUserId,
          familyId: finalFamilyId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Sync failed: ${response.status} - ${errorText}`);
      } else {
        console.log('✅ Sync successful!');
      }
    } catch (error) {
      console.error('❌ Error during external sync:', error);
    }
  }
}
