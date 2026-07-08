import {
  School,
  Stethoscope,
  Route,
  Droplet,
  Zap,
  Hammer,
  Home,
  Wheat,
  Shield,
  CircleEllipsis,
  type LucideProps,
} from "lucide-react";
import type { CategoryMeta } from "@/lib/categories";

const ICONS: Record<CategoryMeta["icon"], React.ComponentType<LucideProps>> = {
  school: School,
  stethoscope: Stethoscope,
  road: Route,
  droplet: Droplet,
  zap: Zap,
  hammer: Hammer,
  home: Home,
  wheat: Wheat,
  shield: Shield,
  "circle-ellipsis": CircleEllipsis,
};

export function CategoryIcon({
  icon,
  ...props
}: { icon: CategoryMeta["icon"] } & LucideProps) {
  const Icon = ICONS[icon];
  return <Icon {...props} />;
}
