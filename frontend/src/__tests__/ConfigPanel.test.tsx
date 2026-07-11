import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigPanel } from "../components/ConfigPanel";
import "../widgets";
import { getWidgetDefinition } from "../widgets/registry";

describe("ConfigPanel", () => {
  it("renders a color input for the categorical widget's barColor field", () => {
    const def = getWidgetDefinition("categorical")!;
    render(
      <ConfigPanel fields={def.configFields ?? []} config={{ barColor: "#6366f1" }} onChange={() => {}} />
    );
    const input = screen.getByDisplayValue("#6366f1") as HTMLInputElement;
    expect(input.type).toBe("color");
  });

  it("calls onChange with the field key/value when a control changes", () => {
    const def = getWidgetDefinition("hierarchical")!;
    const onChange = vi.fn();
    render(
      <ConfigPanel fields={def.configFields ?? []} config={{ showLabels: true }} onChange={onChange} />
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith({ showLabels: false });
  });

  it("shows a fallback message when a widget declares no configurable fields", () => {
    render(<ConfigPanel fields={[]} config={{}} onChange={() => {}} />);
    expect(screen.getByText(/no configurable options/i)).toBeInTheDocument();
  });

  it("every built-in widget type has at least one configFields entry", () => {
    for (const type of ["categorical", "temporal", "hierarchical", "relational"]) {
      const def = getWidgetDefinition(type)!;
      expect(def.configFields?.length).toBeGreaterThan(0);
    }
  });
});
