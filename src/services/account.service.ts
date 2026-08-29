import { accountRepository, AccountRepository } from "@/repositories/account.repository";
import { transactionRepository, TransactionRepository } from "@/repositories/transaction.repository";
import { parseToMinorUnits } from "@/lib/money/money";
import { CreateAccountInput, UpdateAccountInput } from "@/schemas/account.schema";
import { NotFoundError, ValidationError } from "@/lib/errors/errors";
import { IAccount } from "@/models/Account";

export interface AccountDto {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalanceMinor: number;
  currentBalanceMinor: number; // Derived balance from ledger
  institution?: string;
  last4?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AccountService {
  constructor(
    private accountRepo: AccountRepository = accountRepository,
    private txRepo: TransactionRepository = transactionRepository
  ) {}

  private mapToDto(account: IAccount, ledgerDelta = 0): AccountDto {
    return {
      id: account._id.toString(),
      name: account.name,
      type: account.type,
      currency: account.currency,
      openingBalanceMinor: account.openingBalanceMinor,
      currentBalanceMinor: account.openingBalanceMinor + ledgerDelta,
      institution: account.institution,
      last4: account.last4,
      notes: account.notes,
      isArchived: account.isArchived,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async listAccounts(userId: string, includeArchived = false): Promise<AccountDto[]> {
    const accounts = await this.accountRepo.findByUserId(userId, includeArchived);
    return Promise.all(
      accounts.map(async (acc) => {
        const delta = await this.txRepo.getAccountLedgerDelta(acc._id, userId);
        return this.mapToDto(acc, delta);
      })
    );
  }

  async getAccount(id: string, userId: string): Promise<AccountDto> {
    const account = await this.accountRepo.findByIdAndUserId(id, userId);
    if (!account) {
      throw new NotFoundError("Account not found.");
    }
    const delta = await this.txRepo.getAccountLedgerDelta(account._id, userId);
    return this.mapToDto(account, delta);
  }

  async createAccount(userId: string, input: CreateAccountInput): Promise<AccountDto> {
    let openingMinor = 0;
    if (input.openingBalance !== undefined) {
      try {
        openingMinor = parseToMinorUnits(input.openingBalance);
      } catch {
        throw new ValidationError("Invalid opening balance amount.", {
          openingBalance: ["Must be a valid monetary value"],
        });
      }
    }

    const account = await this.accountRepo.create({
      userId,
      name: input.name,
      type: input.type,
      currency: input.currency || "INR",
      openingBalanceMinor: openingMinor,
      institution: input.institution,
      last4: input.last4,
      notes: input.notes,
    });

    return this.mapToDto(account, 0);
  }

  async updateAccount(
    id: string,
    userId: string,
    input: UpdateAccountInput
  ): Promise<AccountDto> {
    const existing = await this.accountRepo.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new NotFoundError("Account not found.");
    }

    const updated = await this.accountRepo.update(id, userId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.institution !== undefined ? { institution: input.institution } : {}),
      ...(input.last4 !== undefined ? { last4: input.last4 } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
    });

    if (!updated) {
      throw new NotFoundError("Account not found.");
    }

    const delta = await this.txRepo.getAccountLedgerDelta(updated._id, userId);
    return this.mapToDto(updated, delta);
  }

  async archiveAccount(id: string, userId: string, isArchived = true): Promise<AccountDto> {
    const account = await this.accountRepo.archive(id, userId, isArchived);
    if (!account) {
      throw new NotFoundError("Account not found.");
    }
    const delta = await this.txRepo.getAccountLedgerDelta(account._id, userId);
    return this.mapToDto(account, delta);
  }
}

export const accountService = new AccountService();
