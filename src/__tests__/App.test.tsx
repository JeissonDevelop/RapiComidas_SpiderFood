import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import App from "../App";
import "@testing-library/jest-dom/vitest";

describe("SpiderFood App Tests", () => {
  afterEach(() => cleanup());

  describe("Menú Principal", () => {
    it("debe mostrar el logo y título de SpiderFood", async () => {
      render(<App />);
      expect(screen.getByText(/SpiderFood Comida Rápida/i)).toBeInTheDocument();
      expect(screen.getByAltText(/SpiderFood Logo/i)).toBeInTheDocument();
    });

    it("debe mostrar 3 botones principales", async () => {
      render(<App />);
      expect(screen.getByText(/Elegir comida/i)).toBeInTheDocument();
      expect(screen.getByText(/Ver Carrito/i)).toBeInTheDocument();
      expect(screen.getByText(/Pedidos Pendientes/i)).toBeInTheDocument();
    });

    it("debe mostrar 4 productos con stock en el menú", async () => {
      render(<App />);
      const productos = await screen.findAllByRole("listitem");
      expect(productos).toHaveLength(4);
    });

    it("debe mostrar nombres de los productos", async () => {
      render(<App />);
      expect(
        await screen.findByText(/Hamburguesa de Pollo/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Hamburguesa Vegetariana/i)).toBeInTheDocument();
      expect(screen.getByText(/Patatas Fritas/i)).toBeInTheDocument();
      expect(screen.getByText(/Helado/i)).toBeInTheDocument();
    });
  });

  describe("Carta de Productos", () => {
    it("debe mostrar la carta al hacer clic en Elegir comida", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      expect(await screen.findByText(/Carta/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Pulsa sobre cada producto/i),
      ).toBeInTheDocument();
    });

    it("debe mostrar 4 productos con imágenes en la carta", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      const imagenes = await screen.findAllByRole("img", {
        name: /Hamburguesa|Patatas|Helado/i,
      });
      expect(imagenes.length).toBeGreaterThanOrEqual(4);
    });

    it("debe mostrar precios de los productos", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      const precios = await screen.findAllByText(/€/i);
      expect(precios.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Detalle de Producto", () => {
    it("debe abrir el detalle al hacer clic en un producto", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      const primerProducto = (
        await screen.findAllByRole("img", { name: /Hamburguesa de Pollo/i })
      )[0];
      fireEvent.click(primerProducto);
      expect(await screen.findByText(/Stock disponible/i)).toBeInTheDocument();
    });

    it("debe mostrar controles de cantidad", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      const primerProducto = (
        await screen.findAllByRole("img", { name: /Hamburguesa de Pollo/i })
      )[0];
      fireEvent.click(primerProducto);
      expect(await screen.findByLabelText(/Cantidad/i)).toBeInTheDocument();
    });

    it("debe tener botón de agregar al carrito", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      const primerProducto = (
        await screen.findAllByRole("img", { name: /Hamburguesa de Pollo/i })
      )[0];
      fireEvent.click(primerProducto);
      expect(
        await screen.findByText(/Agregar.*al Carrito/i),
      ).toBeInTheDocument();
    });
  });

  describe("Carrito de Compras", () => {
    it("debe mostrar carrito vacío inicialmente", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Ver Carrito/i));
      expect(
        await screen.findByText(/El carrito está vacío/i),
      ).toBeInTheDocument();
    });

    it("debe mostrar título del carrito", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Ver Carrito/i));
      expect(await screen.findByText(/Tu Carrito/i)).toBeInTheDocument();
    });
  });

  describe("Navegación", () => {
    it("debe volver al menú desde la carta", async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Elegir comida/i));
      await screen.findByText(/Carta/i);
      fireEvent.click(screen.getByText(/Volver al menú/i));
      expect(await screen.findByText(/Menús Disponibles/i)).toBeInTheDocument();
    });

    it("debe alternar entre secciones", async () => {
      render(<App />);
      // Ir a carrito
      fireEvent.click(screen.getByText(/Ver Carrito/i));
      expect(await screen.findByText(/Tu Carrito/i)).toBeInTheDocument();
      // Volver
      fireEvent.click(screen.getByText(/Volver/i));
      expect(await screen.findByText(/Menús Disponibles/i)).toBeInTheDocument();
    });
  });
});
