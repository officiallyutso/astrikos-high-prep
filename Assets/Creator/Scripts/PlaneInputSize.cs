using UnityEngine;
using TMPro;

public class PlaneSizeInput : MonoBehaviour
{
    public TMP_InputField widthInput;
    public TMP_InputField heightInput;
    public PlaneController planeController;

    public void ApplySize()
    {
        int widthMultiplier = int.Parse(widthInput.text);
        int heightMultiplier = int.Parse(heightInput.text);

        planeController.SetPlaneSize(widthMultiplier, heightMultiplier);
    }
}
