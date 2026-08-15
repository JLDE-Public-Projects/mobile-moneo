import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidPassword, isValidUsername, normalizeUsername } from '@/utils/validation';

/** Credenciales entregadas al llamador tras un envío válido. */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Opciones de {@link useLoginForm}. */
interface UseLoginFormOptions {
  /**
   * Handler asíncrono de envío. Recibe las credenciales validadas y debe lanzar
   * un error para señalar un fallo de autenticación (el mensaje se muestra).
   */
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
}

/** Todo lo que la vista de login necesita para renderizar y operar el formulario. */
interface UseLoginFormResult {
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  /** Mensaje de error a mostrar, o cadena vacía si no hay ninguno. */
  errorMessage: string;
  /** True mientras el handler de envío está en curso. */
  isSubmitting: boolean;
  /** True cuando los campos están completos. Controla el estado del botón. */
  canSubmit: boolean;
  /** Valida y delega en el `onSubmit` proporcionado. */
  submit: () => Promise<void>;
}

/**
 * Encapsula el estado y la validación del formulario de login.
 *
 * Es la lógica "contenedora" del patrón contenedor/presentacional: la pantalla
 * queda como una función de render pura mientras aquí viven las reglas y los
 * efectos, aislados y fáciles de testear.
 */
export function useLoginForm({
  onSubmit,
}: UseLoginFormOptions): UseLoginFormResult {
  const { t } = useTranslation();
  const [username, setUsernameValue] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalizamos el usuario al escribir (sin espacios ni caracteres inválidos)
  // y limpiamos cualquier error previo.
  const setUsername = useCallback((value: string) => {
    setUsernameValue(normalizeUsername(value));
    setErrorMessage('');
  }, []);

  // El botón se habilita cuando los campos están COMPLETOS (no vacíos), para
  // que el usuario sienta respuesta al diligenciarlos. La validación de formato
  // se hace al enviar, mostrando un error claro si algo no cumple.
  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0,
    [username, password],
  );

  const submit = useCallback(async () => {
    // Evita toques dobles y envíos mientras hay uno en curso.
    if (isSubmitting) return;

    // Validación de formato al enviar (no al escribir).
    if (!isValidUsername(username) || !isValidPassword(password)) {
      setErrorMessage(t('auth.login.errorInvalid'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onSubmit({ username, password });
    } catch (error) {
      // Mostramos un mensaje amable; registramos la causa real para depurar.
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('auth.login.errorGeneric');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onSubmit, password, t, username]);

  return {
    username,
    password,
    setUsername,
    setPassword,
    errorMessage,
    isSubmitting,
    canSubmit,
    submit,
  };
}
