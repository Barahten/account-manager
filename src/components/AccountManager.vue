<template>
  <div class="container">
    <header class="header">
      <h1>Учетные записи</h1>
      <button @click="add">+ Добавить</button>
    </header>
    <p class="hint">Метки вводятся через ";"</p>
    <div v-for="acc in accounts" :key="acc.id" class="account">
      <div class="row">
        <label>Метка</label>
        <input
          v-model="acc.labelRaw"
          @blur="onBlur(acc.id, 'labelRaw', acc.labelRaw)"
          maxlength="50"
          :class="{ 'input-error': hasError(acc.id, 'labelRaw') }"
        />
        <span v-if="hasError(acc.id, 'labelRaw')" class="error-text">
          Максимум 50 символов
        </span>
      </div>

      <div class="row">
        <label>Тип записи</label>
        <select v-model="acc.type" @change="onSelectChange(acc.id, acc.type)">
          <option value="LDAP">LDAP</option>
          <option value="Local">Локальная</option>
        </select>
      </div>

      <div class="row">
        <label>Логин</label>
        <input
          v-model="acc.login"
          @blur="onBlur(acc.id, 'login', acc.login)"
          maxlength="100"
          :class="{ 'input-error': hasError(acc.id, 'login') }"
        />
        <span v-if="hasError(acc.id, 'login')" class="error-text">
          Логин обязателен, максимум 100 символов
        </span>
      </div>

      <div class="row" v-if="acc.type === 'Local'">
        <label>Пароль</label>
        <input
          type="password"
          v-model="acc.password"
          @blur="onBlur(acc.id, 'password', acc.password)"
          maxlength="100"
          :class="{ 'input-error': hasError(acc.id, 'password') }"
        />
        <span v-if="hasError(acc.id, 'password')" class="error-text">
          Пароль обязателен, максимум 100 символов
        </span>
      </div>

      <div class="row actions">
        <button @click="remove(acc.id)">Удалить</button>
      </div>
      <hr />
    </div>

    <div v-if="accounts.length === 0">Пусто</div>
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