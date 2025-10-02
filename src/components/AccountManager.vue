<template>
  <div class="container mx-auto p-4">
    <header class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Учетные записи</h1>
      <button
        @click="add"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Добавить
      </button>
    </header>


    <div v-for="acc in accounts" :key="acc.id" class="mb-4 p-4 border rounded shadow">
      <div class="flex flex-wrap gap-4 items-start">
        <!-- Метка -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium">Метка</label>
          <input
            v-model="acc.labelRaw"
            @blur="onBlur(acc.id, 'labelRaw', acc.labelRaw)"
            maxlength="50"
            placeholder="Метки вводятся через &quot;;&quot;"
            :class="['mt-1 block w-full rounded border px-2 py-1', hasError(acc.id, 'labelRaw') ? 'border-red-500' : 'border-gray-300']"
          />
          <span v-if="hasError(acc.id, 'labelRaw')" class="text-red-500 text-xs">
            Максимум 50 символов
          </span>
        </div>

        <!-- Тип записи -->
        <div class="flex-none min-w-[120px]">
          <label class="block text-sm font-medium">Тип записи</label>
          <select
            v-model="acc.type"
            @change="onSelectChange(acc.id, acc.type)"
            class="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          >
            <option value="LDAP">LDAP</option>
            <option value="Local">Локальная</option>
          </select>
        </div>

        <!-- Логин -->
        <div :class="acc.type === 'LDAP' ? 'flex-1 min-w-[200px]' : 'flex-1 min-w-[150px]'">
          <label class="block text-sm font-medium">Логин</label>
          <input
            v-model="acc.login"
            @blur="onBlur(acc.id, 'login', acc.login)"
            maxlength="100"
            placeholder="Максимум 100 символов"
            :class="['mt-1 block w-full rounded border px-2 py-1', hasError(acc.id, 'login') ? 'border-red-500' : 'border-gray-300']"
          />
          <span v-if="hasError(acc.id, 'login')" class="text-red-500 text-xs">
            Логин обязателен, максимум 100 символов
          </span>
        </div>

        <!-- Пароль (только Local) -->
        <div v-if="acc.type === 'Local'" class="flex-none min-w-[180px] relative">
          <label class="block text-sm font-medium">Пароль</label>
          <div class="mt-1 relative">
            <input
              :type="acc.showPassword ? 'text' : 'password'"
              v-model="acc.password"
              @blur="onBlur(acc.id, 'password', acc.password)"
              maxlength="100"
              placeholder="Максимум 100 символов"
              :class="['block w-full rounded border px-2 py-1 pr-10', hasError(acc.id, 'password') ? 'border-red-500' : 'border-gray-300']"
            />
            <button
              type="button"
              @click="acc.showPassword = !acc.showPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-gray-200 px-1 rounded"
            >
              {{ acc.showPassword ? 'Скрыть' : 'Показать' }}
            </button>
          </div>
          <span v-if="hasError(acc.id, 'password')" class="text-red-500 text-xs">
            Пароль обязателен, максимум 100 символов
          </span>
        </div>

        <!-- Удалить -->
        <div class="flex-none">
          <button
            @click="remove(acc.id)"
            class="mt-6 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

    <div v-if="accounts.length === 0" class="text-gray-500 text-center">Учетные записи отсутсвуют</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from "vue";
import { useAccountsStore } from "../stores/accounts";
import type { Account } from "../types/account";
export default defineComponent({
  setup() {
    const store = useAccountsStore();
    const errors = reactive<Record<string, Record<string, boolean>>>({});
    function add() {
      store.addEmpty();
    }
    function remove(id: string) {
      store.remove(id);
      delete errors[id];
    }
    function validateField(field: string, value: any, acc: Account) {
      if (field === "login")
        return (
          value &&
          String(value).trim().length > 0 &&
          String(value).length <= 100
        );
      if (field === "password") {
        if (acc.type !== "Local") return true;
        return (
          value !== null &&
          value !== undefined &&
          String(value).trim().length > 0 &&
          String(value).length <= 100
        );
      }
      if (field === "labelRaw")
        return value === "" || String(value).length <= 50;
      return true;
    }
    function setError(id: string, field: string, val: boolean) {
      if (!errors[id]) errors[id] = {};
      errors[id][field] = val;
    }
    function hasError(id: string, field: string) {
      return !!(errors[id] && errors[id][field]);
    }
    function onBlur(id: string, field: string, value: any) {
      const acc = store.accounts.find((a) => a.id === id);
      if (!acc) return;
      const valid = validateField(field, value, acc);
      setError(id, field, !valid);
      if (valid) store.savePartial(id, { [field]: value } as Partial<Account>);
    }
    function onSelectChange(id: string, value: string) {
      const acc = store.accounts.find((a) => a.id === id);
      if (!acc) return;
      store.savePartial(id, {
        type: value as Account["type"],
      } as Partial<Account>);
      if (value === "LDAP") setError(id, "password", false);
      else {
        const passValid = validateField("password", acc.password, {
          ...acc,
          type: "Local",
        });
        setError(id, "password", !passValid);
      }
    }
    return {
      accounts: computed(() => store.accounts),
      add,
      remove,
      onBlur,
      onSelectChange,
      hasError,
    };
  }
})
</script>