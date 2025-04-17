using UnityEngine;
using UnityEngine.UI;

public class MinimapToggler : MonoBehaviour
{
    public RectTransform minimapRect; // Assign your minimap's RectTransform
    public Button toggleButton;       // Assign the button used to expand the minimap

    private Vector2 defaultAnchorMin;
    private Vector2 defaultAnchorMax;
    private Vector2 defaultOffsetMin;
    private Vector2 defaultOffsetMax;
    private bool isFullscreen = false;

    void Start()
    {
        // Save the original RectTransform values
        defaultAnchorMin = minimapRect.anchorMin;
        defaultAnchorMax = minimapRect.anchorMax;
        defaultOffsetMin = minimapRect.offsetMin;
        defaultOffsetMax = minimapRect.offsetMax;

        toggleButton.onClick.AddListener(ToggleFullscreen);
    }

    void Update()
    {
        if (isFullscreen && Input.GetKeyDown(KeyCode.Escape))
        {
            ExitFullscreen();
        }
    }

    public void ToggleFullscreen()
    {
        if (!isFullscreen)
        {
            EnterFullscreen();
        }
    }

    void EnterFullscreen()
    {
        isFullscreen = true;
        minimapRect.anchorMin = Vector2.zero;
        minimapRect.anchorMax = Vector2.one;
        minimapRect.offsetMin = Vector2.zero;
        minimapRect.offsetMax = Vector2.zero;
        toggleButton.gameObject.SetActive(false);
    }

    void ExitFullscreen()
    {
        isFullscreen = false;
        minimapRect.anchorMin = defaultAnchorMin;
        minimapRect.anchorMax = defaultAnchorMax;
        minimapRect.offsetMin = defaultOffsetMin;
        minimapRect.offsetMax = defaultOffsetMax;
        toggleButton.gameObject.SetActive(true);
    }
}
