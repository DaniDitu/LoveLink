import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ActionModal, ActionModalProps } from '../components/ActionModal';

interface DialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  validationString?: string;
  inputPlaceholder?: string;
}

interface DialogContextType {
  showConfirm: (options: DialogOptions) => Promise<boolean>;
  showPrompt: (options: DialogOptions) => Promise<string | null>;
  showAlert: (options: Pick<DialogOptions, 'title' | 'description' | 'isDanger'>) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<Partial<ActionModalProps> & { isOpen: boolean }>({
    isOpen: false
  });

  const close = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        type: 'CONFIRM',
        ...options,
        onConfirm: () => {
          resolve(true);
          close();
        },
        onCancel: () => {
          resolve(false);
          close();
        }
      });
    });
  }, [close]);

  const showPrompt = useCallback((options: DialogOptions) => {
    return new Promise<string | null>((resolve) => {
      setModalState({
        isOpen: true,
        type: 'PROMPT',
        ...options,
        inputValue: '',
        onConfirm: (val) => {
          resolve(val || '');
          close();
        },
        onCancel: () => {
          resolve(null);
          close();
        },
        onInputChange: (val) => setModalState(prev => ({ ...prev, inputValue: val }))
      });
    });
  }, [close]);

  const showAlert = useCallback((options: Pick<DialogOptions, 'title' | 'description' | 'isDanger'>) => {
    return new Promise<void>((resolve) => {
      setModalState({
        isOpen: true,
        type: 'ALERT',
        ...options,
        confirmText: 'Ok',
        onConfirm: () => {
          resolve();
          close();
        },
        onCancel: () => {
          resolve();
          close();
        }
      });
    });
  }, [close]);

  return (
    <DialogContext.Provider value={{ showConfirm, showPrompt, showAlert }}>
      {children}
      {modalState.isOpen && (
        <ActionModal
          isOpen={modalState.isOpen}
          type={modalState.type || 'CONFIRM'}
          title={modalState.title || ''}
          description={modalState.description || ''}
          confirmText={modalState.confirmText}
          cancelText={modalState.cancelText}
          isDanger={modalState.isDanger}
          validationString={modalState.validationString}
          inputPlaceholder={modalState.inputPlaceholder}
          inputValue={modalState.inputValue}
          onInputChange={modalState.onInputChange}
          onConfirm={modalState.onConfirm!}
          onCancel={modalState.onCancel!}
        />
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within DialogProvider');
  return context;
};