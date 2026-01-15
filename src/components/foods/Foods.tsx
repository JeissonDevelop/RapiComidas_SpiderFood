import type { MenuItem } from "../../entities/entities";

interface FoodsProps {
  foodItems: MenuItem[];
  onSelectFood: (food: MenuItem) => void;
}
function Foods(props: FoodsProps) {
  return (
    <>
      <h4 className="foodTitle">Carta</h4>
      <p
        style={{
          textAlign: "center",
          color: "#7f8c8d",
          fontSize: "14px",
          marginBottom: "30px",
        }}
      >
        Pulsa sobre cada producto para añadirlo
      </p>
      <ul className="ulFoods">
        {props.foodItems.map((item) => {
          return (
            <li
              key={item.id}
              className={`liFoods ${item.quantity === 0 ? "outOfStock" : ""}`}
              onClick={() => item.quantity > 0 && props.onSelectFood(item)}
              style={
                item.quantity === 0
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : {}
              }
            >
              <img
                className="foodImg"
                src={`/images/${item.image}`}
                alt={item.name}
              />
              <div className="foodItem">
                <p className="foodDesc">{item.desc}</p>
                <p className="foodPrice">
                  {item.quantity === 0 ? "Sin stock" : `${item.price}€`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
export default Foods;
