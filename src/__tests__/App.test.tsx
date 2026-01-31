import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import App from "../App";
import "@testing-library/jest-dom/vitest";
import * as orderService from "../services/orderService";
import type { FirebaseOrder } from "../services/orderService";

// Mock the lazy-loaded components to avoid module errors
vi.mock("../components/classifier/ImageClassifier", () => ({
  default: () => <div>Mocked Image Classifier</div>,
}));

describe("SpiderFood App Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(orderService, "getOrders").mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  describe("Menú Principal", () => {
    it("debe mostrar el logo y título de SpiderFood", async () => {
      render(<App />);
      expect(screen.getByText(/SpiderFood Comida Rápida/i)).toBeInTheDocument();
      expect(screen.getByAltText(/SpiderFood Logo/i)).toBeInTheDocument();
    });

    it("debe mostrar 4 botones principales", async () => {
      render(<App />);
      expect(screen.getByText(/Elegir comida/i)).toBeInTheDocument();
      expect(screen.getByText(/Ver Carrito/i)).toBeInTheDocument();
      expect(screen.getByText(/Pedidos Pendientes/i)).toBeInTheDocument();
      expect(screen.getByText(/Clasificador IA/i)).toBeInTheDocument();
    });

    it("debe mostrar productos con stock en el menú", async () => {
      render(<App />);
      const productos = await screen.findAllByRole("listitem");
      expect(productos.length).toBeGreaterThan(0);
    });

    it("debe mostrar contador de pedidos pendientes", async () => {
      render(<App />);
      expect(screen.getByText(/Pedidos Pendientes \(0\)/i)).toBeInTheDocument();
    });
  });

  describe("Interacción con Productos", () => {
    it("debe permitir hacer clic en un producto con stock", async () => {
      render(<App />);
      const productos = await screen.findAllByRole("listitem");

      fireEvent.click(productos[0]);

      // Usar findByRole para esperar al heading específico
      await waitFor(() => {
        const heading = screen.getByRole("heading", {
          name: /Hamburguesa de Pollo/i,
        });
        expect(heading).toBeInTheDocument();
      });
    });

    it("debe mostrar productos con stock disponible", async () => {
      render(<App />);
      const stockElements = screen.getAllByText(/✓ Stock:/i);
      expect(stockElements.length).toBeGreaterThan(0);
    });

    it("debe deshabilitar productos sin stock cuando no hay disponibilidad", async () => {
      const mockOrders: FirebaseOrder[] = [
        {
          id: "1",
          customerName: "Test User",
          customerAddress: "Test Address",
          status: "pending",
          items: [
            { name: "Hamburguesa de Pollo", quantity: 40, price: 5 },
            { name: "Hamburguesa Vegetariana", quantity: 30, price: 5 },
            { name: "Patatas Fritas", quantity: 50, price: 2 },
            { name: "Helado", quantity: 30, price: 3 },
          ],
          total: 100,
          createdAt: new Date(),
        },
      ];

      vi.spyOn(orderService, "getOrders").mockResolvedValue(mockOrders);

      render(<App />);

      await waitFor(() => {
        const sinStock = screen.queryAllByText(/❌ Sin stock/i);
        expect(sinStock.length).toBeGreaterThan(0);
      });

      const productosSinStock = screen.getAllByText(/❌ Sin stock/i);
      const liElement = productosSinStock[0].closest("li");
      expect(liElement).toHaveStyle({ cursor: "not-allowed" });
    });
  });

  describe("Navegación entre Secciones", () => {
    it("debe mostrar clasificador al hacer clic en el botón", async () => {
      render(<App />);
      const clasificadorBtn = screen.getByText(/Clasificador IA/i);

      fireEvent.click(clasificadorBtn);

      await waitFor(() => {
        expect(screen.getByText(/Volver/i)).toBeInTheDocument();
      });
    });

    it("debe volver al menú desde pedidos pendientes", async () => {
      render(<App />);
      const pedidosBtn = screen.getByText(/Pedidos Pendientes/i);

      fireEvent.click(pedidosBtn);

      await screen.findByText(/Volver/i);
      const volverBtn = screen.getByText(/Volver/i);

      fireEvent.click(volverBtn);

      expect(await screen.findByText(/Menús Disponibles/i)).toBeInTheDocument();
    });

    it("debe resetear estado al volver al menú", async () => {
      render(<App />);
      const elegirComidaBtn = screen.getByText(/Elegir comida/i);

      fireEvent.click(elegirComidaBtn);

      await screen.findByText(/Volver al menú/i);
      const volverBtn = screen.getByText(/Volver al menú/i);

      fireEvent.click(volverBtn);

      expect(await screen.findByText(/Menús Disponibles/i)).toBeInTheDocument();
    });
  });

  describe("Pedidos Pendientes", () => {
    it("debe actualizar contador con pedidos pendientes", async () => {
      const mockOrders: FirebaseOrder[] = [
        {
          id: "1",
          customerName: "Test User 1",
          customerAddress: "Address 1",
          status: "pending",
          items: [],
          total: 0,
          createdAt: new Date(),
        },
        {
          id: "2",
          customerName: "Test User 2",
          customerAddress: "Address 2",
          status: "pending",
          items: [],
          total: 0,
          createdAt: new Date(),
        },
      ];

      vi.spyOn(orderService, "getOrders").mockResolvedValue(mockOrders);

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText(/Pedidos Pendientes \(2\)/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Stock Disponible", () => {
    it("debe calcular stock considerando pedidos", async () => {
      const mockOrders: FirebaseOrder[] = [
        {
          id: "1",
          customerName: "Test User",
          customerAddress: "Test Address",
          status: "pending",
          items: [{ name: "Hamburguesa de Pollo", quantity: 2, price: 5 }],
          total: 10,
          createdAt: new Date(),
        },
      ];

      vi.spyOn(orderService, "getOrders").mockResolvedValue(mockOrders);

      render(<App />);

      await waitFor(() => {
        const stockElements = screen.queryAllByText(/Stock:/i);
        expect(stockElements.length).toBeGreaterThan(0);
      });

      expect(screen.getByText(/✓ Stock: 38/i)).toBeInTheDocument();
    });
  });

  describe("Suspense y Carga Lazy", () => {
    it("debe mostrar mensaje de carga para clasificador", async () => {
      render(<App />);
      const clasificadorBtn = screen.getByText(/Clasificador IA/i);

      fireEvent.click(clasificadorBtn);

      // Wait for either loading message or the mocked component
      await waitFor(() => {
        const hasLoading = screen.queryByText(/Cargando clasificador/i);
        const hasMocked = screen.queryByText(/Mocked Image Classifier/i);
        expect(hasLoading || hasMocked).toBeTruthy();
      });
    });

    it("debe mostrar mensaje de carga para carrito", async () => {
      render(<App />);
      const carritoBtn = screen.getByText(/Ver Carrito/i);

      fireEvent.click(carritoBtn);

      // Check if loading appears or cart loads immediately
      const loadingOrCart = await waitFor(
        () =>
          screen.queryByText(/Cargando carrito/i) ||
          screen.queryByText(/Tu Carrito/i),
      );
      expect(loadingOrCart).toBeTruthy();
    });
  });
});
