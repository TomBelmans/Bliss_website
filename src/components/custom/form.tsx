"use client";

import { useRef, type FormEventHandler, type FormHTMLAttributes, type PropsWithChildren } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

interface FormProps<T extends FieldValues>
  extends PropsWithChildren,
    Omit<FormHTMLAttributes<HTMLFormElement>, "action"> {
  hookForm: UseFormReturn<T>;
  action: (formData: FormData) => void;
}

/**
 * Wrapt een `<form action={formAction}>` zodat react-hook-form eerst
 * client-side valideert (`form.formState.errors`, getoond via `FormError`)
 * vóór de server action effectief aangeroepen wordt. Zonder deze wrapper
 * blijft `form.formState.errors` altijd leeg, want react-hook-form valideert
 * pas zodra `handleSubmit` ergens aangeroepen wordt.
 */
function Form<T extends FieldValues>({
  children,
  action,
  hookForm,
  ...formAttributes
}: FormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);
  const validated = useRef(false);

  const onSubmit: FormEventHandler = (event) => {
    if (validated.current) {
      // Al gevalideerd (deze aanroep komt van requestSubmit() hieronder): laat 'm gewoon doorgaan.
      validated.current = false;
      return;
    }

    // Nog niet gevalideerd: blokkeer deze submit, valideer client-side, en dien pas
    // opnieuw in als dat slaagt (react-hook-form roept de server action dan niet zelf
    // aan — dat is precies waarom we via `formRef.requestSubmit()` de échte submit
    // opnieuw triggeren i.p.v. de fn uit `handleSubmit` te gebruiken).
    event.preventDefault();
    void hookForm.handleSubmit(() => {
      validated.current = true;
      // state-updates zijn async: wacht een tick zodat `validated.current` al
      // geregistreerd staat tegen de tijd dat de nieuwe submit binnenkomt.
      setTimeout(() => formRef.current?.requestSubmit());
    })(event);
  };

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} {...formAttributes}>
      {children}
    </form>
  );
}

export default Form;
