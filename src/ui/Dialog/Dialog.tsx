import {
  Dialog as AriaDialog,
  ModalOverlay,
  ModalOverlayProps as AriaModalOverlayProps,
  Modal,
  Heading,
} from "react-aria-components";
import { Button } from "../Button/Button";
import "./Dialog.css";

interface ModalOverlayProps extends AriaModalOverlayProps {
  title: string;
}

export function Dialog({
  children,
  title,
  ...modalOverlayProps
}: ModalOverlayProps) {
  return (
    <ModalOverlay {...modalOverlayProps}>
      <Modal>
        <AriaDialog>
          {({ close }) => (
            <>
              <div className="dialog-heading-container">
                <Heading slot="title">{title}</Heading>
                <Button onPress={close} aria-label="Close">
                  ❌
                </Button>
              </div>
              {children}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
