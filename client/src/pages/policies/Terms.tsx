import PolicyPage from "@/components/policy/PolicyPage";
import { POLICIES } from "@/content/policies";

export default function TermsPolicy() {
  return <PolicyPage policy={POLICIES.terms} />;
}
