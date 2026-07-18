import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import InputField from "../ui/InputField";
import StatusBadge from "../ui/StatusBadge";

const signatureFonts = [
  "Brush Script MT, cursive",
  "Snell Roundhand, cursive",
  "Segoe Script, cursive",
  "Georgia, serif",
];

function SignaturePad({ signerName, signerRole, onChange }) {
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const fileInputRef = useRef(null);
  const [method, setMethod] = useState("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [typedSignature, setTypedSignature] = useState(signerName || "");
  const [fontFamily, setFontFamily] = useState(signatureFonts[0]);
  const [uploadedSignature, setUploadedSignature] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = 260 * ratio;
      canvas.style.height = "260px";

      const context = canvas.getContext("2d");
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineWidth = 2.5;
      context.lineCap = "round";
      context.strokeStyle = "#1E3A8A";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (method === "type" && typedSignature.trim()) {
      onChange({
        method: "type",
        value: typedSignature.trim(),
        fontFamily,
      });
      return;
    }

    if (method === "upload" && uploadedSignature) {
      onChange({
        method: "upload",
        value: uploadedSignature,
      });
      return;
    }

    if (method === "draw" && hasDrawing && canvasRef.current) {
      onChange({
        method: "draw",
        value: canvasRef.current.toDataURL("image/png"),
      });
      return;
    }

    onChange(null);
  }, [fontFamily, hasDrawing, method, onChange, typedSignature, uploadedSignature]);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    if (method !== "draw") {
      return;
    }

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getCanvasPoint(event);

    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing || method !== "draw") {
      return;
    }

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getCanvasPoint(event);

    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.strokeStyle = "#1E3A8A";
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      const rect = canvasRef.current.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
    }

    setHasDrawing(false);
    setUploadedSignature("");
    setTypedSignature("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedSignature(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Digital Signature
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {signerRole}: {signerName || "Signer"}
          </p>
        </div>
        <StatusBadge variant="primary">State only</StatusBadge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {["draw", "type", "upload"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMethod(option)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
              method === option
                ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            {option} Signature
          </button>
        ))}
      </div>

      <div className="mt-6">
        {method === "draw" && (
          <div>
            <div
              ref={canvasWrapRef}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full touch-none rounded-xl bg-white shadow-inner"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Draw your signature inside the box using mouse, trackpad, or touch.
            </p>
          </div>
        )}

        {method === "type" && (
          <div className="space-y-4">
            <InputField
              label="Typed signature"
              placeholder="Type signer name"
              value={typedSignature}
              onChange={(event) => setTypedSignature(event.target.value)}
            />
            <InputField
              as="select"
              label="Signature style"
              value={fontFamily}
              onChange={(event) => setFontFamily(event.target.value)}
            >
              {signatureFonts.map((font) => (
                <option key={font} value={font}>
                  {font.split(",")[0]}
                </option>
              ))}
            </InputField>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p
                className="break-words text-3xl text-[#1E3A8A] sm:text-4xl"
                style={{ fontFamily }}
              >
                {typedSignature || "Signature Preview"}
              </p>
            </div>
          </div>
        )}

        {method === "upload" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <label className="block text-sm font-semibold text-slate-700">
                Upload PNG/JPG signature
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleUpload}
                className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1E3A8A] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </div>

            {uploadedSignature && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <img
                  src={uploadedSignature}
                  alt="Uploaded signature preview"
                  className="max-h-40 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <Button onClick={clearSignature} variant="secondary">
          Clear
        </Button>
        <StatusBadge variant={method === "draw" && !hasDrawing ? "warning" : "success"}>
          {method === "draw" && !hasDrawing ? "Awaiting signature" : "Signature ready"}
        </StatusBadge>
      </div>
    </Card>
  );
}

export default SignaturePad;
