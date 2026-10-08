import PolicyPage from "@/components/policy/PolicyPage";
import { POLICIES } from "@/content/policies";

export default function ShippingPolicy() {
  return <PolicyPage policy={POLICIES.shipping} />;
}
