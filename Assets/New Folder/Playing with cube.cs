using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;

public class Playingwithcube : MonoBehaviour
{
    public LayerMask selectableLayer; // Set this to the layer of objects you want to select
    private Transform selectedObject;
    public Button Move_Button;
    private Vector3 offset;
    private bool Mode_Move=false;
    private float zCoord;

    void Update()
    {
        HandleSelection();
        if(Input.GetKey(KeyCode.Escape)){
            Mode_Move=false;
            Move_Button.image.color=new Color(105f/255, 95f/255, 95f/255);
        }
        if(Mode_Move){
            HandleDragging();
        }
    }
    public void EnableMoveMode(){
        Mode_Move=true;
        Move_Button.image.color=new Color(150f/255, 152f/255, 200f/255); 
    }
    void HandleSelection()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, Mathf.Infinity, selectableLayer))
            {
                selectedObject = hit.transform;
                zCoord = Camera.main.WorldToScreenPoint(selectedObject.position).z;
                offset = selectedObject.position - GetMouseWorldPos();
                selectedObject.AddComponent<Outline>();
            }
            else
            {
                if (selectedObject != null)
                {
                    ResetSelection();
                    selectedObject = null;
                }
            }
        }
    }

    void HandleDragging()
    {
        if (selectedObject != null && Input.GetMouseButton(0))
        {
            selectedObject.position = GetMouseWorldPos() + offset;
        }
    }

    Vector3 GetMouseWorldPos()
    {
        Vector3 mousePoint = Input.mousePosition;
        mousePoint.z = zCoord;
        return Camera.main.ScreenToWorldPoint(mousePoint);
    }

    void ResetSelection()
    {
       Destroy(selectedObject.GetComponent<Outline>());
    }
}
