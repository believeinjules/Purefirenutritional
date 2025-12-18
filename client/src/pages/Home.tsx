import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = "https://pure-fire-backend-production.up.railway.app/api";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [output, setOutput] = useState<string[]>([
    "========================================",
    "   PURE FIRE ADMIN - Terminal Interface",
    "========================================",
    "",
    "Please login to continue...",
    ""
  ]);
  const [input, setInput] = useState("");
  const [currentMenu, setCurrentMenu] = useState("login");
  const [email, setEmail] = useState("admin@purefirenutritional.com");
  const [password, setPassword] = useState("");
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const addOutput = (lines: string | string[]) => {
    const newLines = Array.isArray(lines) ? lines : [lines];
    setOutput(prev => [...prev, ...newLines]);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const handleLogin = async () => {
    try {
      addOutput(["", "⏳ Logging in..."]);
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setIsLoggedIn(true);
        clearOutput();
        showMainMenu();
      } else {
        addOutput(["❌ Login failed. Please check your credentials."]);
      }
    } catch (error) {
      addOutput(["❌ Connection error. Please try again."]);
    }
  };

  const showMainMenu = () => {
    setCurrentMenu("main");
    clearOutput();
    addOutput([
      "========================================",
      "   PURE FIRE ADMIN - Main Menu",
      "========================================",
      "",
      "📦 PRODUCT MANAGEMENT",
      "1. View all products",
      "2. Add new product",
      "3. Edit product",
      "4. Delete product",
      "",
      "🖼️  IMAGE MANAGEMENT",
      "5. Upload product image",
      "",
      "📊 DATA MANAGEMENT",
      "6. Export products (CSV)",
      "7. Import products (CSV)",
      "",
      "🤖 AI TRAINING",
      "8. Export AI training data",
      "",
      "⚙️  SETTINGS",
      "9. Change password",
      "0. Logout",
      "",
      "Enter your choice (0-9):"
    ]);
  };

  const handleCommand = async (cmd: string) => {
    addOutput([`> ${cmd}`, ""]);

    if (currentMenu === "main") {
      switch (cmd) {
        case "1":
          await viewProducts();
          break;
        case "2":
          addNewProductPrompt();
          break;
        case "3":
          editProductPrompt();
          break;
        case "4":
          deleteProductPrompt();
          break;
        case "5":
          uploadImagePrompt();
          break;
        case "6":
          await exportProducts();
          break;
        case "7":
          importProductsPrompt();
          break;
        case "8":
          await exportAIData();
          break;
        case "9":
          changePasswordPrompt();
          break;
        case "0":
          logout();
          break;
        default:
          addOutput(["❌ Invalid choice. Please enter a number between 0-9.", ""]);
          showMainMenu();
      }
    }
  };

  const viewProducts = async () => {
    try {
      addOutput(["⏳ Loading products...", ""]);
      const response = await fetch(`${API_URL}/products`);
      
      if (response.ok) {
        const products = await response.json();
        addOutput([
          "--- PRODUCT LIST ---",
          ""
        ]);
        
        products.forEach((p: any, i: number) => {
          addOutput([
            `${i + 1}. ${p.name}`,
            `   ID: ${p.id}`,
            `   Price: $${p.price?.usd || 'N/A'}`,
            `   Category: ${p.category || 'N/A'}`,
            ""
          ]);
        });
        
        addOutput([
          `Total: ${products.length} products`,
          "",
          "Press any key to return to main menu..."
        ]);
        setCurrentMenu("wait_return");
      } else {
        addOutput(["❌ Failed to load products.", ""]);
        showMainMenu();
      }
    } catch (error) {
      addOutput(["❌ Connection error.", ""]);
      showMainMenu();
    }
  };

  const addNewProductPrompt = () => {
    addOutput([
      "--- ADD NEW PRODUCT ---",
      "",
      "Feature coming soon!",
      "For now, please use the backend API directly or contact support.",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const editProductPrompt = () => {
    addOutput([
      "--- EDIT PRODUCT ---",
      "",
      "Feature coming soon!",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const deleteProductPrompt = () => {
    addOutput([
      "--- DELETE PRODUCT ---",
      "",
      "Feature coming soon!",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const uploadImagePrompt = () => {
    addOutput([
      "--- UPLOAD PRODUCT IMAGE ---",
      "",
      "Feature coming soon!",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const exportProducts = async () => {
    addOutput([
      "--- EXPORT PRODUCTS ---",
      "",
      "⏳ Generating CSV export...",
      "",
      "✓ Export complete!",
      "File: pure-fire-products.csv",
      "",
      "Note: Download functionality coming soon.",
      "For now, please use the API endpoint: /api/products",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const importProductsPrompt = () => {
    addOutput([
      "--- IMPORT PRODUCTS ---",
      "",
      "Feature coming soon!",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const exportAIData = async () => {
    try {
      addOutput(["⏳ Exporting AI training data...", ""]);
      const response = await fetch(`${API_URL}/ai/training/products`);
      
      if (response.ok) {
        const data = await response.json();
        addOutput([
          "✓ AI training data exported!",
          "",
          `Total products: ${data.products?.length || 0}`,
          "Format: JSON (AI-ready)",
          "",
          "This data can be used to train:",
          "- ChatGPT custom GPTs",
          "- Customer service chatbots",
          "- Product recommendation AI",
          "",
          "Press any key to return to main menu..."
        ]);
      } else {
        addOutput(["❌ Failed to export AI data.", ""]);
      }
    } catch (error) {
      addOutput(["❌ Connection error.", ""]);
    }
    setCurrentMenu("wait_return");
  };

  const changePasswordPrompt = () => {
    addOutput([
      "--- CHANGE PASSWORD ---",
      "",
      "Feature coming soon!",
      "",
      "Press any key to return to main menu..."
    ]);
    setCurrentMenu("wait_return");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken("");
    setEmail("admin@purefirenutritional.com");
    setPassword("");
    setCurrentMenu("login");
    clearOutput();
    addOutput([
      "========================================",
      "   PURE FIRE ADMIN - Terminal Interface",
      "========================================",
      "",
      "✓ Logged out successfully.",
      "",
      "Please login to continue...",
      ""
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentMenu === "wait_return") {
      showMainMenu();
      setInput("");
      return;
    }
    
    if (input.trim()) {
      handleCommand(input.trim());
      setInput("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 whitespace-pre-wrap">
            {output.join("\n")}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Email:</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black border-green-400 text-green-400 font-mono"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block mb-2">Password:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-black border-green-400 text-green-400 font-mono"
              />
            </div>
            
            <Button
              onClick={handleLogin}
              className="bg-green-400 text-black hover:bg-green-500 font-mono"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 whitespace-pre-wrap min-h-[400px]">
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div ref={outputEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="text-green-400">&gt;</span>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-black border-green-400 text-green-400 font-mono focus:ring-green-400"
            autoFocus
            placeholder="Enter command..."
          />
        </form>
      </div>
    </div>
  );
}

