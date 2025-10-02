import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Account, LabelItem, AccountType } from '../types/account'

const STORAGE_KEY = 'accounts_v1'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  // Загружаем данные из localStorage
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) accounts.value = JSON.parse(raw)
    } catch (e) {
      console.error(e)
    }
  }

  // Сохраняем данные в localStorage
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value))
  }

  // Добавление новой пустой учетной записи (не сохраняем сразу)
  function addEmpty() {
    const newAccount: Account = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      labelRaw: '',
      labels: [],
      type: 'Local' as AccountType,
      login: '',
      password: '',
    }
    accounts.value.push(newAccount)
  }

  // Удаление учетной записи по id
  function remove(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id)
    persist()
  }

  // Частичное обновление учетной записи
  function savePartial(id: string, patch: Partial<Account>) {
    const current = accounts.value.find(a => a.id === id)
    if (!current) return

    const updated: Account = {
      id: current.id,
      labelRaw: patch.labelRaw ?? current.labelRaw,
      labels: patch.labelRaw !== undefined
        ? patch.labelRaw
            .split(';')
            .map(s => s.trim())
            .filter(Boolean)
            .map(t => ({ text: t } as LabelItem))
        : current.labels,
      type: patch.type ?? current.type,
      login: patch.login ?? current.login,
      password: patch.type === 'LDAP'
        ? null
        : patch.password ?? current.password,
    }

    // Валидация обязательных полей
    const isLoginValid = updated.login.trim().length > 0 && updated.login.length <= 100
    const isPasswordValid = updated.type === 'LDAP' || (updated.password?.trim().length ?? 0) > 0 && (updated.password?.length ?? 0) <= 100

    // Сохраняем только если все обязательные поля валидны
    if (isLoginValid && isPasswordValid) {
      const idx = accounts.value.findIndex(a => a.id === id)
      accounts.value[idx] = updated
      persist() // теперь сохраняем в localStorage
    } else {
      // Обновляем только state для отображения в интерфейсе, без persist()
      const idx = accounts.value.findIndex(a => a.id === id)
      accounts.value[idx] = updated
    }
  }

  load()

  return { accounts, addEmpty, remove, savePartial }
})
