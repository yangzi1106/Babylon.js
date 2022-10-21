import type { Scene } from "core/scene";
import type { Nullable } from "core/types";
import { useState, useEffect, createContext, useRef } from "react";
import type { FC } from "react";
import { CommandBarComponent } from "shared-ui-components/components/bars/CommandBarComponent";
import { FlexibleGridLayout } from "shared-ui-components/components/layout/FlexibleGridLayout";
import { SceneContext } from "./SceneContext";
import style from "./workbench.modules.scss";
import type { GraphNode } from "shared-ui-components/nodeGraphSystem/graphNode";
import { SelectionContext } from "./components/SelectionContext";
import { initialLayout } from "./initialLayout";
import { Vector3 } from "core/Maths/math";
import { SetPositionAction } from "./actions/actions/SetPositionAction";
import { StateMachine } from "./stateMachine/StateMachine";
// @ts-ignore
import { LogAction } from "./actions/actions/LogAction";

export type WorkbenchProps = {};

// eslint-disable-next-line @typescript-eslint/naming-convention
const INITIAL_WORKBENCH_COLOR = "#AAAAAA";

export const stateValuesProvider = createContext<{ stateValues: Record<string, Vector3>; setStateValues: (v: Record<string, Vector3>) => void }>({
    stateValues: {},
    setStateValues: () => {},
});

export const Workbench: FC<WorkbenchProps> = () => {
    const [workAreaColor, setWorkAreaColor] = useState(INITIAL_WORKBENCH_COLOR);
    const [scene, setScene] = useState<Nullable<Scene>>(null);
    const [selectedNode, setSelectedNode] = useState<Nullable<GraphNode>>(null);
    const stateValues = useRef<Record<string, Vector3>>({});
    const setStateValues = (v: Record<string, Vector3>) => {
        stateValues.current = v;
    };

    useEffect(() => {
        const stateValues = {
            "Sphere Origin": new Vector3(0, 0, 0),
            "Sphere Destination": new Vector3(1, 1, 1),
        };
        setStateValues(stateValues);
    }, []);

    useEffect(() => {
        if (scene) {
            const node = scene.getMeshByName("sphere");
            if (node) {
                const stateMachine = new StateMachine(scene, node);

                stateMachine.setStartingState("Sphere Origin");
                stateMachine.addTransition("Sphere Origin", "Sphere Destination");
                stateMachine.addTransition("Sphere Destination", "Sphere Origin");

                const setPositionOriginAction = new SetPositionAction();
                setPositionOriginAction.targetNode = node;
                setPositionOriginAction.targetPosition = stateValues.current["Sphere Origin"];
                stateMachine.setStateAction("Sphere Origin", setPositionOriginAction);
                // stateMachine.setStateAction("Sphere Origin", new LogAction("Enter Sphere Origin"));

                const setPositionDestinationAction = new SetPositionAction();
                setPositionDestinationAction.targetNode = node;
                setPositionDestinationAction.targetPosition = stateValues.current["Sphere Destination"];
                stateMachine.setStateAction("Sphere Destination", setPositionDestinationAction);
                // stateMachine.setStateAction("Sphere Destination", new LogAction("Enter Sphere Destination"));

                stateMachine.start();

                // const actionManager = new ActionManager(scene);
                // const clickTrigger = new ClickTrigger(node);
                // const logAction = new LogAction("You clicked on the sphere!");
                // const setPositionAction = new SetPositionAction();
                // setPositionAction.targetPosition = new Vector3(1, 1, 1);
                // setPositionAction.targetNode = node;
                // actionManager.addBehavior(clickTrigger, logAction);
                // actionManager.addBehavior(clickTrigger, setPositionAction);
                // actionManager.start();
                // // Get node
                //     // Apply initial state
                //     let currentState = "Sphere Origin";
                //     node.position = stateValues.current[currentState];

                //     node.metadata = {};
                //     node.metadata.onStateChanged = new Observable<{ state: string }>();
                //     node.metadata.onStateChanged.notifyObservers({ state: currentState });

                //     scene.onPointerPick = (pickedPoint, pickInfo) => {
                //         if (pickInfo.pickedMesh !== node) return;

                //         // Change state
                //         if (currentState === "Sphere Origin") {
                //             currentState = "Sphere Destination";
                //         } else {
                //             currentState = "Sphere Origin";
                //         }
                //         // Execute action
                //         node.position = stateValues.current[currentState];

                //         node.metadata.onStateChanged.notifyObservers({ state: currentState });
                //     };
            }
        }
    }, [scene]);

    return (
        <SceneContext.Provider value={{ scene, setScene }}>
            <SelectionContext.Provider value={{ selectedNode, setSelectedNode }}>
                <stateValuesProvider.Provider value={{ stateValues: stateValues.current, setStateValues }}>
                    <div className={style.workbenchContainer}>
                        <CommandBarComponent
                            artboardColor={workAreaColor}
                            artboardColorPickerColor={INITIAL_WORKBENCH_COLOR}
                            onArtboardColorChanged={(newColor) => setWorkAreaColor(newColor)}
                        />
                        <div className={style.workArea} style={{ backgroundColor: workAreaColor }}>
                            <FlexibleGridLayout layoutDefinition={initialLayout} />
                        </div>
                    </div>
                </stateValuesProvider.Provider>
            </SelectionContext.Provider>
        </SceneContext.Provider>
    );
};
