import { CrmStatus } from "@/lib/domain/enums/crm-status";

export class CrmService {
    private readonly apiKey: string = process.env.CRM_API_KEY || '';
    
    async updateUserStatus(crmId: string, status: CrmStatus): Promise<boolean | void> {
        const response = await fetch(
            `https://api.baserow.io/api/database/rows/table/770157/${crmId}/?user_field_names=true`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    "state": status
                })
            }
        )
        if (!response.ok) {
            throw new Error(`Failed to update CRM user status: ${response.statusText}`);
        }
        return true;
    }
}