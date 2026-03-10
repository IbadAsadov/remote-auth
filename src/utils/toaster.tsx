import {
  Toaster as ChakraToaster,
  createToaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastIndicator,
  ToastRoot,
  ToastTitle,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

export function AppToaster() {
  return (
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: "auto" }}>
      {(toast) => (
        <ToastRoot key={toast.id}>
          <ToastIndicator />
          <div style={{ flex: 1 }}>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </ChakraToaster>
  );
}
