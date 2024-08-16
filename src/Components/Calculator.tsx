import { useEffect, useState } from "react";
import buttonInfo from "./ButtonInfo.ts";
import "../Styles/calculator.css";

const Calculator = () => {
  const [output, setOutput] = useState("0");
  const [formula, setFormula] = useState("");
  const [operation, setOperation] = useState("");

  const lastOpIdx = (str: string) => {
    const lastIdx = Math.max(
      str.lastIndexOf("+"),
      str.lastIndexOf("-"),
      str.lastIndexOf("×"),
      str.lastIndexOf("/")
    );
    return str[str.length - 1] == ")" ? lastIdx - 2 : lastIdx;
  };

  const numClick = (str: string) => {
    if (formula.includes("=")) {
      setFormula("")
      setOutput("0")
    } else if (operation) {
      if (str == "0") return;
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

  const clearClick = () => {
    const clearAll = ["0", "-0"].includes(output) || formula.includes("=");
    setOutput("0");
    setOperation("");
    setFormula((prev) => {
      if (clearAll) return "";
      else if (lastOpIdx(prev) == -1) return "";
      else return prev.slice(0, lastOpIdx(prev) + 1);
    });
  };

  const deleteClick = () => {
    if (formula.includes("=")) {
      clearClick();
      return;
    }
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

  const percentClick = () => {
    const res = "" + eval(`${output}/100`);
    setFormula((prev) => prev.slice(0, lastOpIdx(prev) + 1) + res);
    setOutput(res);
  };

  const operationClick = (key: string) => {
    const symbol = key == "multiply" ? "×" : buttonInfo[key];
    if (!formula) setFormula("0" + symbol);
    else if (formula.includes("="))
      setFormula((prev) => prev.slice(prev.indexOf("=") + 1) + symbol);
    else if (operation) {
      if (key == "subtract") {
        setFormula(
          (prev) =>
            prev.slice(0, lastOpIdx(prev) + 1) +
            (prev[prev.length - 1] == ")" ? "" : "(-)")
        );
        setOutput((prev) => (prev == "-0" ? "0" : "-0"));
      } else setFormula((prev) => prev.slice(0, lastOpIdx(prev)) + symbol);
    } else setFormula((prev) => prev + symbol);
    setOperation(key);
  };

  const evaluate = () => {
    if (formula.includes("=")) return;
    let output = eval(formula.replace("×", "*"));
    output = Math.round((output + Number.EPSILON) * 100000000) / 100000000;
    setFormula((prev) => (prev ? prev + "=" + output : "0=0"));
    setOutput(output ? output : "0");
  };

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isNaN(+e.key) || e.key == ".") numClick(e.key);
      else if (e.key == "Backspace") e.ctrlKey ? clearClick() : deleteClick();
      else if (e.key == "+") operationClick("add");
      else if (e.key == "-") operationClick("subtract");
      else if (e.key == "*") operationClick("multiply");
      else if (e.key == "/") operationClick("divide");
      else if (e.key == "%") percentClick();
      else if (e.key == "Enter") evaluate();
    };

    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    numClick,
    clearClick,
    deleteClick,
    operationClick,
    percentClick,
    evaluate,
  ]);

  useEffect(() => {
    const clearBtn = document.getElementById("clear") as HTMLButtonElement;
    const clearAll = ["0", "-0"].includes(output) || formula.includes("=");
    clearBtn.innerHTML = clearAll ? "AC" : "C";
  }, [output]);

  return (
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
          const operations = ["add", "subtract", "multiply", "divide"];

          if (!isNaN(+value) || value == ".") click = () => numClick(value);
          else if (operations.includes(key)) click = () => operationClick(key);
          else if (key == "percent") click = percentClick;
          else if (key == "sign") click = signClick;
          else if (key == "delete") click = deleteClick;
          else if (key == "clear") click = clearClick;
          else if (key == "equals") {
            click = evaluate;
            className += " equals";
          }

          if (key == operation) className += " selected";
          else if ([...operations, "equals"].includes(key))
            className += " operation";
          else if (["clear", "delete", "percent"].includes(key))
            className += " action";

          return (
            <button className={className} id={key} onClick={click} key={key}>
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calculator;
