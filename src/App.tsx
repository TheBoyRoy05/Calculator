import { useEffect, useState } from "react";
import buttonInfo from "./ButtonInfo";

const App = () => {
  const [output, setOutput] = useState("0");
  const [formula, setFormula] = useState("");
  const [operation, setOperation] = useState("");

  const lastOpIdx = (str: string) => {
    const lastIdx = Math.max(
      str.lastIndexOf("+"),
      str.lastIndexOf("-"),
      str.lastIndexOf("x"),
      str.lastIndexOf("/")
    );
    return str[str.length - 1] == ")" ? lastIdx - 2 : lastIdx;
  };

  const numClick = (str: string) => {
    if (operation) {
      setOperation("");
      setOutput("0");
    }
    const setter = (prev: string) => {
      if (str == "." && prev.slice(lastOpIdx(prev) + 1).includes("."))
        return prev;
      if (prev == "0") return (str == "." ? prev : "") + str;
      if (prev == "-0") return (str == "." ? prev : "-") + str;
      else {
        if (prev[prev.length - 1] == ")") return prev.slice(0, -1) + str + ")";
        else return prev + str;
      }
    };
    setOutput(setter);
    setFormula(setter);
  };

  const clearClick = (all: boolean) => {
    setOutput("0");
    setOperation("");
    setFormula((prev) => {
      if (all) return "";
      else if (lastOpIdx(prev) == -1) return "";
      else return prev.slice(0, lastOpIdx(prev) + 1);
    });
  };

  const deleteClick = () => {
    setOutput((prev: string) => (prev.length == 1 ? "0" : prev.slice(0, -1)));
    setFormula((prev) => {
      if (prev[prev.length - 1] == ")") {
        if (prev.length == 3) return "";
        else return prev.slice(0, -2) + ")";
      } else return prev.slice(0, -1);
    });
  };

  const signClick = () => {
    setFormula((prev) => {
      const opIdx = lastOpIdx(prev) + 1;
      return (
        prev.slice(0, opIdx) +
        (prev[prev.length - 1] == ")"
          ? prev.slice(opIdx + 2, -1)
          : `(-${prev.slice(opIdx)})`)
      );
    });
    setOutput((prev) => (prev[0] == "-" ? prev.slice(1) : "-" + prev));
  };

  const operationClick = (key: string) => {
    if (operation) {
      if (key == "subtract") {
        setFormula(
          (prev) =>
            prev.slice(0, lastOpIdx(prev) + 1) +
            (prev[prev.length - 1] == ")" ? "" : "(-)")
        );
        setOutput((prev) => (prev == "-0" ? "0" : "-0"));
      } else
        setFormula((prev) => prev.slice(0, lastOpIdx(prev)) + buttonInfo[key]);
    } else setFormula((prev) => prev + buttonInfo[key]);
    setOperation(key);
  };

  const evaluate = () => {
    const output = eval(formula.replace("x", "*"));
    setFormula(output);
    setOutput(output);
  };

  useEffect(() => {
    const clearBtn = document.getElementById("clear") as HTMLButtonElement;
    clearBtn.innerHTML = ["0", "-0"].includes(output) ? "AC" : "C";
  }, [output]);

  return (
    <>
      <div className="calculator">
        <div className="screen">
          <div className="formula">{formula}</div>
          <div className="output" id="display">
            {output}
          </div>
        </div>
        <div className="buttons">
          {Object.entries(buttonInfo).map(([key, value]) => {
            let click;
            let className = "button";

            if (!isNaN(+value) || value == ".") click = () => numClick(value);
            else if (key == "clear") click = () => clearClick(["0", "-0"].includes(output));
            else if (key == "delete") click = deleteClick;
            else if (key == "sign") click = signClick;
            else if (["add", "subtract", "multiply", "divide"].includes(key))
              click = () => operationClick(key);
            else if (key == "equals") click = evaluate;

            if (key == operation) className += " selected";
            return (
              <button className={className} id={key} onClick={click} key={key}>
                {value}
              </button>
            );
          })}
        </div>
      </div>
      <div className="author">By Issac Roy</div>
    </>
  );
};

export default App;
