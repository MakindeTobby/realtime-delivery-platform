import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  //
  return (
    <div className="absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
      <span className="text-primary text-[10rem] font-extrabold leading-none">
        404
      </span>
      <h2 className="font-heading my-2 text-2xl font-bold text-gray-500">
        Something&apos;s missing
      </h2>
      <p className="text-gray-500">
        Sorry, the page you are looking for doesn&apos;t exist or has been
        moved.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => navigate(-1)} variant="outline" size="lg">
          Go back
        </Button>
        <Button onClick={() => navigate("/")} size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
