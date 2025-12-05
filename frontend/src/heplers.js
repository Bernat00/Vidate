import api from "./api.js";
import qs from "qs";

export async function login (email, password, rememberMe = false) {
    const response = await api.post('/auth/token',
          qs.stringify({
          grant_type: 'password', //todo change this mert depracataed
          username: email,
          password: password,
      }),
          {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              }
          }
      );

      const token = response.data.access_token;

      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
}


export async function logout() {
    localStorage.clear();
    sessionStorage.clear();
}

export async function getCurrentUser() {
    return api.get('users/me');
}