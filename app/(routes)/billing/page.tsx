import { PricingTable } from "@clerk/nextjs";

function Billing() {
  return (
    <div className="mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-bold text-3xl mb-2">Choose Your Plan</h2>
        <p className="text-lg text-gray-600">
          Select a subscription that fits your needs
        </p>
      </div>
      <div className="flex">
        <PricingTable />
      </div>
    </div>
  );
}

export default Billing;
