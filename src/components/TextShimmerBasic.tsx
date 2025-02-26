import { TextShimmer } from "./ui/text-shimmer";

const TextShimmerBasic = ({ children }: { children: string }) => {
  return (
    <TextShimmer className="font-mono font-bold text-2xl" duration={3}>
      {children}
    </TextShimmer>
  );
};

export default TextShimmerBasic;
