"use server";

import { CrmStatus } from "../domain/enums/crm-status";
import { CrmService } from "../services/crm";

export async function updateCrmStatus(crmId: string, status: CrmStatus): Promise<boolean | void> {
    const crmService = new CrmService();
    return await crmService.updateUserStatus(crmId, status);
}