import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import App from "../App";
import "@testing-library/jest-dom/vitest";

describe("SpiderFood App Tests", () => {
  // Limpia el DOM después de cada prueba
  afterEach(() => cleanup());

  describe("Carta Inicial - Verificar productos", () => {
    it("debe mostrar 4 productos en la carta inicial", async () => {
      render(<App />); // Renderizamos la app
      const productos = await screen.findAllByRole("listitem"); // Buscamos todos los <li>
      expect(productos).toHaveLength(4); // Comprobamos que hay 4
    });

    it("debe mostrar stock y nombre de los productos", async () => {
      render(<App />); // Render
      // Comprobamos que aparecen los nombres
      expect(
        await screen.findByText(/Hamburguesa de Pollo/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Hamburguesa Vegetariana/i)).toBeInTheDocument();
      expect(screen.getByText(/Patatas Fritas/i)).toBeInTheDocument();
      expect(screen.getByText(/Helado/i)).toBeInTheDocument();
      // Comprobamos que hay números de stock (formato "# 40")
      expect(screen.getAllByText(/#\s*\d+/i).length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Pantalla Pedir Comida", () => {
    it("debe mostrar 4 productos en la pantalla de pedidos", async () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /pedir comida/i })); // Entrar a pedir
      const productos = await screen.findAllByRole("listitem"); // Productos en la lista
      expect(productos).toHaveLength(4);
    });

    it("debe mostrar precios de los productos", async () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /pedir comida/i }));
      const precios = await screen.findAllByText(/€/i); // Buscamos textos con "€"
      expect(precios.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Actualización de precio en compra", () => {
    it("debe actualizar correctamente el precio al cambiar la cantidad", async () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /pedir comida/i })); // Abrir pedir
      fireEvent.click((await screen.findAllByRole("img"))[0]); // Seleccionar primer producto
      const inputCantidad = await screen.findByLabelText(/cantidad/i); // Input de cantidad
      expect(await screen.findByText(/24/)).toBeInTheDocument(); // Precio inicial 24
      fireEvent.change(inputCantidad, { target: { value: "2" } }); // Cambiar a 2
      expect(await screen.findByText(/48/)).toBeInTheDocument(); // Precio 48
    });

    it("debe calcular correctamente el precio total para múltiples cantidades", async () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /pedir comida/i }));
      fireEvent.click((await screen.findAllByRole("img"))[0]); // Primer producto
      const inputCantidad = await screen.findByLabelText(/cantidad/i);
      fireEvent.change(inputCantidad, { target: { value: "3" } }); // Cantidad 3
      expect(await screen.findByText(/72/)).toBeInTheDocument(); // Precio 72
    });

    it("debe mostrar el precio unitario inicial del producto", async () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /pedir comida/i }));
      fireEvent.click((await screen.findAllByRole("img"))[0]); // Primer producto
      expect(await screen.findByText(/24/)).toBeInTheDocument(); // Precio inicial 24
    });
  });
});
