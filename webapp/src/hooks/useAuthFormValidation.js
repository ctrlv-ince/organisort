import { useEffect, useMemo, useState } from 'react';

const useAuthFormValidation = ({
  values,
  validators,
  fields,
  debounceMs = 250,
}) => {
  const [touched, setTouched] = useState(() =>
    fields.reduce((accumulator, field) => ({ ...accumulator, [field]: false }), {})
  );
  const [fieldErrors, setFieldErrors] = useState(() =>
    fields.reduce((accumulator, field) => ({ ...accumulator, [field]: '' }), {})
  );

  const validationErrors = useMemo(() => validators(values), [validators, values]);

  const resolveValidationErrors = (overrideValues) => validators(overrideValues || values);

  useEffect(() => {
    const touchedFields = fields.filter((field) => touched[field]);

    if (!touchedFields.length) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };

        touchedFields.forEach((field) => {
          nextErrors[field] = validationErrors[field] || '';
        });

        return nextErrors;
      });
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, fields, touched, validationErrors]);

  const touchField = (field, overrideValues) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));

    const currentValidationErrors = resolveValidationErrors(overrideValues);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: currentValidationErrors[field] || '',
    }));
  };

  const validateFieldsNow = (targetFields, overrideValues) => {
    const currentValidationErrors = resolveValidationErrors(overrideValues);

    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      targetFields.forEach((field) => {
        nextErrors[field] = currentValidationErrors[field] || '';
      });
      return nextErrors;
    });
  };

  const validateOnSubmit = () => {
    const submitValidationErrors = resolveValidationErrors();

    setTouched((currentTouched) => {
      const nextTouched = { ...currentTouched };
      fields.forEach((field) => {
        nextTouched[field] = true;
      });
      return nextTouched;
    });

    setFieldErrors(
      fields.reduce(
        (accumulator, field) => ({
          ...accumulator,
          [field]: submitValidationErrors[field] || '',
        }),
        {}
      )
    );

    return submitValidationErrors;
  };

  const hasErrors = fields.some((field) => Boolean(validationErrors[field]));

  return {
    touched,
    fieldErrors,
    hasErrors,
    touchField,
    validateFieldsNow,
    validateOnSubmit,
  };
};

export default useAuthFormValidation;
