import { defineStore } from "pinia"
import AuthAPI from "../api/AuthApi"

import type { User } from "../types/user.interface"
import { ref, computed } from "vue"
import MatchApi from "~/api/MatchApi"

export const useAuth = defineStore('auth', () => {
  let user = ref<User | null>()

  let receivedMatches = computed(() => {
    // if matches are not populated or not presented
    if (typeof (user.value?.matches[0]) == "string" || !user.value?.matches) return []
    let result = [];

    for (let match of user.value.matches) {
      if (match.receiver._id === user.value._id) {
        result.push(match)
      }
    }

    return result;
  })

  let sentMatches = computed(() => {
    // if matches are not populated or not presented
    if (typeof (user.value?.matches[0]) == "string" || !user.value?.matches) return []
    let result = [];
    for (let match of user.value.matches) {
      if (match.sender._id === user.value._id) {
        result.push(match)
      }
    }

    return result;
  })

  async function registration(data: any): Promise<boolean> {
    try {
      const response = await AuthAPI.registration(data)

      if (response.status.value != "success") return false;

      if (response.data.value) {
        user.value = response.data.value.user
      }
      return true
    } catch {
      return false
    }
  }


  async function registerStudent(user: any): Promise<boolean> {
    try {
      const response = await AuthAPI.registerStudent(user)
      if (response.data.value) {
        console.log(response);
      }
      return true
    } catch {
      return false
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await AuthAPI.login(email, password)
      if (response.data.value) {
        user.value = response.data.value.user
      }
      return response
    } catch {
      return false
    }
  }

  async function checkAuth(): Promise<boolean> {
    try {
      if (user.value?._id) {
        return true
      }
      const response = await AuthAPI.refresh()

      if (response.data.value?._id) {
        user.value = response.data.value
        return true
      } else {
        return false
      }
    } catch (error) {
      await logout()
      return false
    }
  }

  async function getAllUsers(): Promise<any> {
    try {
      return await AuthAPI.getAllUsers()
    } catch (error) {
      console.log(error);
    }
  }

  // async function checkAdmin(): Promise<boolean | undefined> {
  //   try {
  //     if (!user.value?._id) {
  //       const response = await AuthAPI.refresh()
  //       if (response.data.value?._id) {
  //         user.value = response.data.value
  //       }
  //     }

  //     //array.some() проверяет, удовлетворяет ли хотя бы один элемент массива условию
  //     const hasAdminRole = user?.value?.roles.some(role => role === 'admin');
  //     return hasAdminRole
  //   } catch (error) {
  //     await logout()
  //     return false
  //   }
  // }
  // async function checkManager(): Promise<boolean | undefined> {
  //   try {
  //     if (!user.value?._id) {
  //       const response = await AuthAPI.refresh()
  //       if (response.data.value?._id) {
  //         user.value = response.data.value
  //       }
  //     }

  //     //array.some() проверяет, удовлетворяет ли хотя бы один элемент массива условию
  //     const hasManagerRole = user?.value?.roles.some(role => role === 'manager');
  //     return hasManagerRole
  //   } catch (error) {
  //     await logout()
  //     return false
  //   }
  // }

  async function logout(): Promise<any> {
    try {
      let res = await AuthAPI.logout()

      user.value = null
      useRouter().push('/')
      return res
    } catch { }
  }

  async function updateUser(newUser: any, userId: string) {
    try {
      let res = await AuthAPI.updateUser(newUser, userId);

      if (res.status.value == 'success') {
        user.value = res.data.value;
      }

      return res
    } catch { }
  }

  async function sendResetLink(email: string): Promise<any> {
    try {
      return await AuthAPI.sendResetLink(email)
    } catch (error) {
      console.log(error);
    }
  }

  async function resetPassword(password: string, userId: string, token: string): Promise<any> {
    try {
      return await AuthAPI.resetPassword(password, userId, token)
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadAvatar(fd: FormData, userId: string) {
    try {
      return await AuthAPI.uploadAvatar(fd, userId);
    } catch (error) {
      console.log(error);
    }
  }

  function Equals(other: User): boolean {
    if (other == null) return false;

    return user.value?.email == other.email &&
      user.value.name == other.name &&
      user.value.surname == other.surname;
  }

  async function populateMatches() {
    if (!user.value?._id) return;

    let result = await MatchApi.populateMatches(user.value?._id);

    if (result != null) {
      user.value.matches = result.matches;
    }
  }

  async function updateAboutMe(data: { personal?: any, partnerFilters?: any }): Promise<{ success: boolean }> {
    if (!user.value?._id)
      return { success: false };

    let result = await AuthAPI.updateAboutMe({ userId: user.value._id, ...data });

    if (result?.updatedUser != null) {
      user.value = result.updatedUser;
      return { success: true };
    }
    return { success: false };
  }

  return {
    // variables
    user, receivedMatches, sentMatches,
    // functions
    registration, login, checkAuth, logout,
    updateUser, sendResetLink, resetPassword, registerStudent,
    getAllUsers, uploadAvatar, Equals, populateMatches, updateAboutMe
  }
})
