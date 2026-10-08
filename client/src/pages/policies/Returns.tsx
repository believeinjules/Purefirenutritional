import PolicyPage from "@/components/policy/PolicyPage";
import { POLICIES } from "@/content/policies";

export default function ReturnsPolicy() {
  return <PolicyPage policy={POLICIES.returns} />;
}
