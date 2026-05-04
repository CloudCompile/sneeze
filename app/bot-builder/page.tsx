import { BotBuilderApp } from "@/components/botBuilder/BotBuilderApp";

export const metadata = {
  title: "Discord Bot Builder",
  description: "Create production-ready Discord bots visually with our drag-and-drop builder",
};

export default function BotBuilderPage() {
  return <BotBuilderApp />;
}
