"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export function AlertDialogComponent({
  title,
  text,
  action,
  onCancel,
  canCencel,
}: {
  title: string;
  text: string;
  action: number | (() => void);
  onCancel: () => void;
  canCencel: boolean;
}) {
  return (
    <AlertDialog open={title !== "" || text !== ""}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {canCencel && (
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          )}
          {typeof action === "function" && (
            <AlertDialogAction
              onClick={() => {
                action();
                onCancel();
              }}
            >
              Continue
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const AlertContext = createContext(
  (
    title: string,
    text: string,
    action: number | (() => void),
    canCencel: boolean
  ) => {
    return [title, text, action, canCencel];
  }
);

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [action, setAction] = useState<number | (() => void)>(0);
  const [canCencel, setCanCencel] = useState<boolean>(false);

  const onChangeAlert = useCallback(
    (
      title: string,
      text: string,
      action: number | (() => void),
      canCencel: boolean
    ) => {
      setTitle(title);
      setText(text);
      setAction(action);
      setCanCencel(canCencel);
      return [title, text, action, canCencel];
    },
    []
  );

  const onCancel = () => {
    setTitle("");
    setText("");
    setAction(0);
  };

  return (
    <AlertContext.Provider value={onChangeAlert}>
      {(title != "" || text != "") && (
        <AlertDialogComponent
          title={title}
          text={text}
          action={action}
          onCancel={onCancel}
          canCencel={canCencel}
        />
      )}
      {children}
    </AlertContext.Provider>
  );
}

export const useAlertContext = () => useContext(AlertContext);
