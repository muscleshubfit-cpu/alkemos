import { ReferralView } from "@/components/views/ReferralView";
import { Preconnects } from "@/components/hub-head-resources";

export default function Page() {
  return (
    <>
      <Preconnects hosts={["https://api.qrserver.com"]} />
      <ReferralView />
    </>
  );
}
