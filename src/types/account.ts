export type AccountType = 'LDAP' | 'Local';

export interface LabelItem { text: string }

export interface Account {
    id: string
    labelRaw: string
    labels: LabelItem[]
    type: AccountType
    login: string
    password: string | null
    showPassword?: boolean
}