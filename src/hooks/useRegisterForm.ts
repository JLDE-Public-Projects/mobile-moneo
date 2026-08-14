import {useCallback, useMemo, useState} from 'react';
import {
   isValidInviteCode,
   isValidName,
   isValidPassword,
   isValidUsername,
   normalizeInviteCode,
   normalizeUsername,
} from '@/utils/validation';

/** Datos entregados al llamador cuando el registro es válido. */
export interface RegisterData {
   username: string;
   name: string;
   password: string;
   inviteCode: string;
}

/** Opciones de {@link useRegisterForm}. */
interface UseRegisterFormOptions {
   /**
    * Handler asíncrono de registro. Recibe los datos ya validados y debe lanzar
    * un error para señalar un fallo (el mensaje se muestra al usuario).
    */
   onSubmit: (data: RegisterData) => Promise<void>;
}

/** Todo lo que la vista de registro necesita para renderizar y operar. */
interface UseRegisterFormResult {
   username: string;
   name: string;
   password: string;
   inviteCode: string;
   setUsername: (value: string) => void;
   setName: (value: string) => void;
   setPassword: (value: string) => void;
   setInviteCode: (value: string) => void;
   /** Mensaje de error a mostrar, o cadena vacía si no hay ninguno. */
   errorMessage: string;
   /** True mientras el handler de envío está en curso. */
   isSubmitting: boolean;
   /** True cuando todos los campos están completos. */
   canSubmit: boolean;
   /** Valida y delega en el `onSubmit` proporcionado. */
   submit: () => Promise<void>;
}

/**
 * Encapsula el estado y las reglas del formulario de creación de cuenta.
 *
 * Es la lógica "contenedora" del patrón contenedor/presentacional: la pantalla
 * queda como una función de render pura mientras aquí viven la validación y los
 * efectos, aislados y fáciles de testear.
 */
export function useRegisterForm({onSubmit}: UseRegisterFormOptions): UseRegisterFormResult {

   const [username, setUsernameValue] = useState('');
   const [name, setNameValue] = useState('');
   const [password, setPasswordValue] = useState('');
   const [inviteCode, setInviteCodeValue] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Limpiar el error en cuanto el usuario edita cualquier campo evita que un
   // mensaje viejo se quede fijo mientras corrige.
   const clearError = useCallback(() => setErrorMessage(''), []);

   // El usuario se normaliza al escribir: sin espacios ni caracteres inválidos.
   const setUsername = useCallback(
      (value: string) => {
         setUsernameValue(normalizeUsername(value));
         clearError();
      },
      [clearError],
   );

   const setName = useCallback(
      (value: string) => {
         setNameValue(value);
         clearError();
      },
      [clearError],
   );

   const setPassword = useCallback(
      (value: string) => {
         setPasswordValue(value);
         clearError();
      },
      [clearError],
   );

   // El código se normaliza a mayúsculas al escribir para que coincida con el
   // formato mostrado (MONEO-0000) y con la validación.
   const setInviteCode = useCallback(
      (value: string) => {
         setInviteCodeValue(normalizeInviteCode(value));
         clearError();
      },
      [clearError],
   );

   // El botón se habilita cuando los cuatro campos están COMPLETOS (no vacíos),
   // para que el usuario sienta respuesta al diligenciarlos. La validación de
   // formato se hace al enviar, mostrando un error claro si algo no cumple.
   const canSubmit = useMemo(() =>
         username.trim().length > 0 &&
         name.trim().length > 0 &&
         password.length > 0 &&
         inviteCode.trim().length > 0,
      [username, name, password, inviteCode],
   );

   const submit = useCallback(async () => {
      // Evita toques dobles y envíos mientras hay uno en curso.
      if (isSubmitting) return;

      // Validación de formato al enviar (no al escribir).
      if (
         !isValidUsername(username) ||
         !isValidName(name) ||
         !isValidPassword(password) ||
         !isValidInviteCode(inviteCode)
      ) {
         setErrorMessage('Revisa los datos y el código de invitación.');
         return;
      }

      setIsSubmitting(true);
      setErrorMessage('');
      try {
         await onSubmit({
            username,
            name: name.trim(),
            password,
            inviteCode: normalizeInviteCode(inviteCode),
         });
      } catch (error) {
         // Mostramos un mensaje amable; registramos la causa real para depurar.
         const message =
            error instanceof Error && error.message
               ? error.message
               : 'No pudimos crear tu cuenta. Inténtalo de nuevo.';
         setErrorMessage(message);
      } finally {
         setIsSubmitting(false);
      }
   }, [inviteCode, isSubmitting, name, onSubmit, password, username]);

   return {
      username,
      name,
      password,
      inviteCode,
      setUsername,
      setName,
      setPassword,
      setInviteCode,
      errorMessage,
      isSubmitting,
      canSubmit,
      submit,
   };
}
