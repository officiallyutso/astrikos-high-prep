using UnityEngine;

public class PlaneController : MonoBehaviour
{
    public float width = 20f;
    public float height = 20f;
    public float unitSize = 10f;
     public Material planeMaterial;
     private GameObject plane;
     void Start()
    {
        plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
        plane.transform.localScale = new Vector3(width / 10f, 1, height / 10f);
        plane.GetComponent<Renderer>().material = planeMaterial;
        plane.name = "BuildPlane";
    }

    public void SetPlaneSize(float widthMultiplier, float heightMultiplier)
    {
        width = widthMultiplier * unitSize;
        height = heightMultiplier * unitSize;

        plane.transform.localScale = new Vector3(width / 10f, 1f, height / 10f);
        float posY = transform.position.y;
        transform.position = new Vector3(0, posY, 0);
    }

    public float GetWidth() => width;
    public float GetHeight() => height;

    public bool IsPointInside4x4(Vector3 point)
    {
        float halfW = width / 2f;
        float halfH = height / 2f;

        return (point.x - 3) >= -halfW && (point.x + 3) <= halfW &&
               (point.z - 3) >= -halfH && (point.z + 3) <= halfH;
    }
}
