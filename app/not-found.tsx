import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="page-container py-16 md:py-24">
      <EmptyState
        icon={SearchX}
        title="We couldn’t find that page"
        description="The link may be old or mistyped. The menu has everything we serve."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/menu">Browse menu</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Go home
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
