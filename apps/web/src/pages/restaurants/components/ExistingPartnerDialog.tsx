import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PartnerExistence } from "@/api/auth.api";

type ExistingPartnerDialogProps = {
  open: boolean;
  email: string;
  partner: PartnerExistence | null;
  onContinue: () => void;
  onCancel: () => void;
};

export function ExistingPartnerDialog({
  open,
  email,
  partner,
  onContinue,
  onCancel,
}: ExistingPartnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account already exists</DialogTitle>
          <DialogDescription>
            {partner?.message ?? "We found an account for this email address."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-muted p-4 text-sm">
          {partner?.userName && (
            <p>
              <span className="font-medium">Account holder:</span> {partner.userName}
            </p>
          )}
          <p>
            <span className="font-medium">Email:</span> {email}
          </p>
        </div>
        <DialogDescription>
          Continue to sign in and link your restaurant application to this account, or cancel to use a different email.
        </DialogDescription>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue to sign in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
