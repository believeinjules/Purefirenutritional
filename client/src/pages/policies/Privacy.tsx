import PolicyPage from "@/components/policy/PolicyPage";
import { POLICIES } from "@/content/policies";

export default function PrivacyPolicy() {
  return <PolicyPage policy={POLICIES.privacy} />;
}
