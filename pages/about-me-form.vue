<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

import { toast } from "vue3-toastify"

// Типизация для ссылок на компоненты, чтобы вызывать validate
interface ValidatableComponent {
  validate: () => Promise<boolean>;
}

const userStore = useAuth();
const router = useRouter();

const { user } = userStore;

const step = ref<number>(1);

// Ссылки на компоненты шагов
const personalInfoRef = ref<ValidatableComponent | null>(null);
const partnerFiltersRef = ref<ValidatableComponent | null>(null);

// Хранилище для всех данных формы
const formData = reactive({
  personal: {},
  partnerFilters: {},
});

// Функция для обновления данных конкретного шага
function updateStepData(stepName: 'personal' | 'partnerFilters', data: any) {
  formData[stepName] = data;
}

async function nextStep() {
  let isValid = true;
  if (step.value === 1 && personalInfoRef.value) {
    isValid = await personalInfoRef.value.validate();
  } else if (step.value === 2 && partnerFiltersRef.value) {
    isValid = await partnerFiltersRef.value.validate();
  }

  if (isValid) {
    if (step.value < 3) {
      step.value++;
    }
  } else {
    toast("Данные заполнены некорректно!", { type: "warning" })
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value--;
  }
}

function setUserData() {
  updateStepData('personal', {
    gender: user?.gender,
    langLevel: user?.langLevel,
    age: user?.age,
    idealPartnerDescription: user?.idealPartnerDescription
  })
  updateStepData('partnerFilters', {
    langLevel: user?.partnerFilters?.langLevel,
    minAge: user?.partnerFilters?.minAge,
    maxAge: user?.partnerFilters?.maxAge,
    gender: user?.partnerFilters?.gender,
  })
}

async function submit() {
  let res = await userStore.updateAboutMe(formData);
  if (res.success) {
    toast("Ваша информация обновлена!", {
      type: "success",
      autoClose: 700,
      onClose: () => {
        router.push("/")
      }
    })
  } else {
    // do nothing, cuz all errors are handled in $apiFetch
  }
}

setUserData()
</script>

<template>
  <v-container>
    <v-row class="d-flex justify-center align-center">
      <v-col cols="12" sm="10" md="7" xl="6">
        <v-window v-model="step">
          <v-window-item :value="1" class="pa-2">
            <AboutMePersonal ref="personalInfoRef" :init-data="formData.personal"
              @update:form-data="data => updateStepData('personal', data)" />
          </v-window-item>

          <v-window-item :value="2" class="pa-2">
            <AboutMePartnerFilters ref="partnerFiltersRef" :init-data="formData.partnerFilters"
              @update:form-data="data => updateStepData('partnerFilters', data)" />
          </v-window-item>

          <v-window-item :value="3" class="pa-2">
            <v-card class="pa-4 text-center">
              <h3 class="text-h6 font-weight-light mb-2">
                Анкета заполнена!
              </h3>
              <span class="text-caption text-grey">Спасибо! Теперь вы можете сохранить анкету.</span>
            </v-card>
          </v-window-item>
        </v-window>

        <v-card-actions>
          <v-btn v-if="step > 1" variant="text" @click="prevStep">
            Назад
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="step < 3" color="primary" variant="flat" @click="nextStep">
            Следующий шаг
          </v-btn>
          <v-btn v-if="step == 3" color="success" variant="flat" @click="submit">
            Сохранить анкету
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-container>
</template>

<style></style>