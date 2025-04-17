using UnityEngine;
using UnityEngine.UI;

public class ModeManager : MonoBehaviour
{
    public Button moveButton;
    public Button scaleButton;

    public Color selectedColor = Color.cyan;
    public Color defaultColor = Color.gray;

    public enum Mode { None, Move, Scale }
    public Mode currentMode = Mode.None;

    public GridBuilder gridBuilder;

    void Start()
    {
        SetMode(0); // None at start
    }

    // Called from Unity button with index: 1 = Move, 2 = Scale
    public void SetMode(int modeIndex)
    {
        currentMode = (Mode)modeIndex;

        // Disable both
        gridBuilder.SetMoveMode(false);
        gridBuilder.SetScaleMode(false);

        switch (currentMode)
        {
            case Mode.Move:
                gridBuilder.SetMoveMode(true);
                break;
            case Mode.Scale:
                gridBuilder.SetScaleMode(true);
                break;
        }

        UpdateButtonColors();
    }

    void UpdateButtonColors()
    {
        moveButton.image.color = (currentMode == Mode.Move) ? selectedColor : defaultColor;
        scaleButton.image.color = (currentMode == Mode.Scale) ? selectedColor : defaultColor;
    }
}
