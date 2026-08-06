import {
  TruckIcon,
  CreditCardIcon,
  ShieldIcon,
  HeadsetIcon,
} from "./icons";

const services = [
  { title: "Fast Delivery Across the Gulf", Icon: TruckIcon },
  { title: "Safe Payment", Icon: CreditCardIcon },
  { title: "Shop With Confidence", Icon: ShieldIcon },
  { title: "24/7 Support", Icon: HeadsetIcon },
];

export default function ServicesStrip() {
  return (
    <section className="bg-paper py-8 pb-14">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {services.map(({ title, Icon }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-4 rounded-lg bg-white px-6 py-10 shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-heading">
                <Icon size={26} />
              </span>
              <p className="text-sm font-semibold text-heading">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
