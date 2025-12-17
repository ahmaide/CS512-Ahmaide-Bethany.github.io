const fragShader = `#version 300 es
precision highp float;

//time for animation
uniform float u_time;
uniform vec2 u_resolution;
uniform int u_maxBounces;
uniform float u_ambientStrength;
uniform float u_lightIntensity;
uniform float u_reflectionStrength;
uniform vec3  u_objectColor;

out vec4 fragColor;

// Basic Material types
const int MATERIAL_DIFFUSE = 0;
const int MATERIAL_REFLECTIVE = 1;
const int MATERIAL_REFRACTIVE = 2;
const int MATERIAL_EMISSIVE = 3;

// special material types
const int MATERIAL_CHESSBOARD = 99;
const int MATERIAL_GLASS = 4;

// view
uniform vec3 u_cameraPos;
uniform vec3 u_cameraForward;
uniform vec3 u_cameraRight;
uniform vec3 u_cameraUp;
uniform float u_fov;


// chessboard / piece info
uniform vec2  u_boardMin;
uniform float u_boardTileSize;

// Video Elements
uniform sampler2D u_videoTexture;
const int MATERIAL_VIDEO = 5;

//  Ray structure
struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
    int material;
    float reflectivity;
    float refractiveIndex;
    float intensity; 
};

struct Cube {
    vec3 center;
    vec3 size;
    vec3 color;
    int material;
    float reflectivity;
    float refractiveIndex;
    float intensity;
    mat3 rotation; 
};

struct Cone {
    vec3 apex;
    vec3 axis;
    float height;
    float radius;
    vec3 color;
    int material;
    float reflectivity;
    float refractiveIndex;
};

struct Plane {
    vec3 normal;
    float d;
    vec3 color;
    int material;
    float reflectivity;
    float refractiveIndex;
};

 // Hit record structure
struct HitData {
    bool hit;
    float t;
    vec3 point;
    vec3 normal;
    vec3 color;
    vec2 uv;
    int material;
    float reflectivity;
    float refractiveIndex;
    float intensity;
};

// scene arrays
#define MAX_SPHERES 30
#define MAX_CUBES    75
#define MAX_CONES    4
#define MAX_PLANES   1

uniform int u_numSpheres;
uniform int u_numCubes;
uniform int u_numCones;
uniform int u_numPlanes;

uniform Sphere u_spheres[MAX_SPHERES];
uniform Cube   u_cubes[MAX_CUBES];
uniform Cone   u_cones[MAX_CONES];
uniform Plane  u_planes[MAX_PLANES];

// / / / / / / / / / / / / / //
// CHESS BOARD SPECIFIC CODE //
// / / / / / / / / / / / / / //

bool hitChessBoard(HitData hit){
    if(hit.material == MATERIAL_CHESSBOARD){
        return true;
    }else{
        return false;
    }
}

vec3 getProceduralBoardColor(vec3 pos)
{
    float tileSize = u_boardTileSize;

    float boardMinX = u_boardMin.x;
    float boardMaxX = boardMinX + 8.0 * tileSize;

    float boardMinZ = u_boardMin.y;
    float boardMaxZ = boardMinZ + 8.0 * tileSize;

    // check if outside playable board area
    if (pos.x < boardMinX || pos.x > boardMaxX ||
        pos.z < boardMinZ || pos.z > boardMaxZ) 
    {
        return vec3(0.0);
    }

    int tileX = int(floor(pos.x / tileSize));
    int tileZ = int(floor(pos.z / tileSize));

    bool isWhite = ((tileX + tileZ) % 2 == 0);

    vec3 whiteColor = vec3(0.8);
    vec3 blackColor = vec3(0.08);

    return isWhite ? whiteColor : blackColor;
}

// / / / / / / / / / / / / / //
// CHESS PIECE SPECIFIC CODE //
// / / / / / / / / / / / / / //



// / / / / / / / / / //
// RAY TRACER CODE   //
// / / / / / / / / / //

bool intersectSphere(Ray ray, Sphere s, out float tHit) {
    vec3 oc = ray.origin - s.center;
    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * dot(oc, ray.direction);
    float c = dot(oc, oc) - s.radius * s.radius;

    float disc = b*b - 4.0*a*c;
    if (disc < 0.0) return false;

    float sqrtDisc = sqrt(disc);
    float t0 = (-b - sqrtDisc) / (2.0*a);
    float t1 = (-b + sqrtDisc) / (2.0*a);

    float t = t0;
    if (t < 0.0) t = t1;
    if (t < 0.0) return false;

    tHit = t;
    return true;
}

bool intersectCube(Ray ray, Cube c, out float tHit, out vec3 normal)
{
    // Move into cube’s local space
    vec3 p = ray.origin - c.center;
    vec3 ro = transpose(c.rotation) * p;
    vec3 rd = transpose(c.rotation) * ray.direction;

    vec3 minB = -c.size;
    vec3 maxB =  c.size;

    float tmin = -1e20;
    float tmax =  1e20;

    // Slab test
    for (int i = 0; i < 3; i++) {
        if (abs(rd[i]) < 1e-6) {
            if (ro[i] < minB[i] || ro[i] > maxB[i])
                return false;
        } else {
            float t1 = (minB[i] - ro[i]) / rd[i];
            float t2 = (maxB[i] - ro[i]) / rd[i];
            float lo = min(t1, t2);
            float hi = max(t1, t2);

            if (lo > tmin) tmin = lo;
            if (hi < tmax) tmax = hi;
            if (tmin > tmax) return false;
        }
    }

    if (tmin < 0.0) return false;

    tHit = tmin;

    // Compute local normal
    vec3 localHit = ro + rd * tmin;
    vec3 n = vec3(0.0);
    vec3 absH = abs(localHit);

    if (absH.x > absH.y && absH.x > absH.z)
        n = vec3(sign(localHit.x), 0.0, 0.0);
    else if (absH.y > absH.x && absH.y > absH.z)
        n = vec3(0.0, sign(localHit.y), 0.0);
    else
        n = vec3(0.0, 0.0, sign(localHit.z));

    // Rotate normal back to world space
    normal = c.rotation * n;

    return true;
}


bool intersectCone(Ray ray, Cone cone, out float tHit, out vec3 normal) {
    vec3 apex = cone.apex;
    vec3 axis = normalize(cone.axis);
    float height = cone.height;
    float radius = cone.radius;

    float k = radius / height;
    float k2 = k * k;

    vec3 v = ray.origin - apex;
    float dv = dot(ray.direction, axis);
    float vv = dot(v, axis);

    vec3 rd_p = ray.direction - dv * axis;
    vec3 v_p  = v           - vv * axis;

    float A = dot(rd_p, rd_p) - k2 * dv * dv;
    float B = 2.0 * (dot(rd_p, v_p) - k2 * dv * vv);
    float C = dot(v_p, v_p) - k2 * vv * vv;

    float disc = B*B - 4.0*A*C;
    if (disc < 0.0) return false;

    float sqrtDisc = sqrt(disc);
    float t0 = (-B - sqrtDisc) / (2.0*A);
    float t1 = (-B + sqrtDisc) / (2.0*A);

    float t = t0;
    if (t < 0.0) t = t1;
    if (t < 0.0) return false;

    vec3 hitPos = ray.origin + t * ray.direction;
    float h = dot(hitPos - apex, axis);
    if (h < 0.0 || h > height) return false;

    vec3 pa = apex + axis * h;
    vec3 n = normalize(hitPos - pa - axis * (radius/height) * h);

    tHit = t;
    normal = n;
    return true;
}

bool intersectPlane(Ray ray, Plane pl, out float tHit) {
    float denom = dot(pl.normal, ray.direction);
    if (abs(denom) < 1e-6) return false;

    float t = -(dot(pl.normal, ray.origin) + pl.d) / denom;
    if (t < 0.0) return false;

    // Calculate hit position
    vec3 hitPos = ray.origin + t * ray.direction;

    float tileSize = u_boardTileSize;
    float boardMinX = u_boardMin.x;
    float boardMaxX = boardMinX + 8.0 * tileSize;
    float boardMinZ = u_boardMin.y;
    float boardMaxZ = boardMinZ + 8.0 * tileSize;

    // Reject hits outside the chessboard area
    if (hitPos.x < boardMinX || hitPos.x > boardMaxX ||
        hitPos.z < boardMinZ || hitPos.z > boardMaxZ) {
        return false;
    }

    tHit = t;
    return true;
}

Sphere lightSphere = Sphere(    
                        vec3(0.0, 5.0, 0.0),
                        1.0,
                        vec3(1.0, 0.8, 0),
                        MATERIAL_EMISSIVE,
                        0.0,
                        1.0,
                        1.0
                    );

// Trace objects in the scene for intersections
HitData traceScene(Ray ray, bool includeLightSphere) {
    HitData closest;
    closest.hit = false;
    closest.t   = 1e20;

    if (includeLightSphere) {
        float t;
        if (intersectSphere(ray, lightSphere, t)) {
            if (t < closest.t) {
                closest.hit      = true;
                closest.t        = t;
                closest.point    = ray.origin + t * ray.direction;
                closest.normal   = normalize(closest.point - lightSphere.center);
                closest.color    = lightSphere.color;
                closest.material = MATERIAL_EMISSIVE;
                }
            }
    }

    // spheres
    for (int i = 0; i < MAX_SPHERES; i++) {
        if (i >= u_numSpheres){
            break;
        }
        float t;
        if (intersectSphere(ray, u_spheres[i], t) && t < closest.t) {
            closest.hit = true;
            closest.t   = t;
            closest.point = ray.origin + t * ray.direction;
            closest.normal = normalize(closest.point - u_spheres[i].center);
            closest.color  = u_spheres[i].color;
            closest.material       = u_spheres[i].material;
            closest.reflectivity   = u_spheres[i].reflectivity;
            closest.refractiveIndex = u_spheres[i].refractiveIndex;
            closest.intensity       = u_spheres[i].intensity;

        }
    }

    // cubes
    for (int i = 0; i < MAX_CUBES; i++) {
        if (i >= u_numCubes){
            break;
        }
        float t;
        vec3 n;

        if (intersectCube(ray, u_cubes[i], t, n) && t < closest.t) {
            closest.hit = true;
            closest.t   = t;
            closest.point = ray.origin + t * ray.direction;
            closest.normal = n;
            closest.color  = u_cubes[i].color;
            closest.material       = u_cubes[i].material;
            closest.reflectivity   = u_cubes[i].reflectivity;
            closest.refractiveIndex = u_cubes[i].refractiveIndex;
            closest.intensity       = u_cubes[i].intensity;

            vec3 p = ray.origin - u_cubes[i].center;
            vec3 ro = transpose(u_cubes[i].rotation) * p;
            vec3 rd = transpose(u_cubes[i].rotation) * ray.direction;
            vec3 localHit = ro + rd * t;

            vec3 s = u_cubes[i].size;
            vec3 dist = abs(localHit) - s;
            vec2 uv = vec2(0.0);

            if (dist.x > dist.y && dist.x > dist.z) {
                uv = localHit.zy / s.zy; 
            } 
            else if (dist.y > dist.x && dist.y > dist.z) {
                uv = localHit.xz / s.xz;
            } 
            else {
                uv = localHit.xy / s.xy;
            }

            closest.uv = uv * 0.5 + 0.5;

        }


    }

    // cones
    for (int i = 0; i < MAX_CONES; i++) {
        if (i >= u_numCones){
            break;
        }
        float t;
        vec3 n;
        if (intersectCone(ray, u_cones[i], t, n) && t < closest.t) {
            closest.hit = true;
            closest.t   = t;
            closest.point = ray.origin + t * ray.direction;
            closest.normal = n;
            closest.color  = u_cones[i].color;
            closest.material       = u_cones[i].material;
            closest.reflectivity   = u_cones[i].reflectivity;
            closest.refractiveIndex = u_cones[i].refractiveIndex;
        }
    }

    // planes
    for (int i = 0; i < MAX_PLANES; i++) {
        if (i >= u_numPlanes){
            break;
        }
        float t;
        if (intersectPlane(ray, u_planes[i], t) && t < closest.t) {
            closest.hit = true;
            closest.t   = t;
            closest.point = ray.origin + t * ray.direction;
            closest.normal = normalize(u_planes[i].normal);
            closest.color  = u_planes[i].color;
            closest.material       = u_planes[i].material;
            closest.reflectivity   = u_planes[i].reflectivity;
            closest.refractiveIndex = u_planes[i].refractiveIndex;
        }
    }

    return closest;
}

// refraction
vec3 refraction(vec3 I, vec3 N, float eta) {
    
    float cosi = clamp(dot(I, N), -1.0, 1.0);
    float etai = 1.0;
    float etat = eta;

    // If cosi < 0 the ray is entering the medium
    if (cosi < 0.0) {
        cosi = -cosi;
    } else {
        N = -N;
        float tmp = etai;
        etai = etat;
        etat = tmp;
    }

    float etaRatio = etai / etat;
    float k = 1.0 - etaRatio * etaRatio * (1.0 - cosi * cosi);

    if (k < 0.0) {
        return vec3(0.0);
    } else {
        return etaRatio * I + (etaRatio * cosi - sqrt(k)) * N;
    }
}

// Schlick approximation
float schlick(float cosine, float ref_idx) {
    float r0 = (1.0 - ref_idx) / (1.0 + ref_idx);
    r0 = r0 * r0;

    return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
}

vec3 sampleSky(vec3 dir) {
    vec3 skyTop    = vec3(0.6, 0.8, 1.0);
    vec3 skyBottom = vec3(0.1, 0.1, 0.2);
    float t = 0.5 * (dir.y + 1.0);
    return mix(skyBottom, skyTop, t);
}

vec3 trace(Ray ray, int maxDepth) {

    vec3 color = vec3(0.0);
    vec3 attenuation = vec3(1.0);

    for (int depth = 0; depth < 8; depth++) {
        if (depth >= maxDepth){
            color += attenuation * sampleSky(ray.direction);
            break;
        }

        // HitData lightHit = traceScene(ray, true);
        HitData hit = traceScene(ray, false);

        if (hitChessBoard(hit)) {
            hit.color = getProceduralBoardColor(hit.point);
         }

        if (!hit.hit) {
            vec3 skyTop    = vec3(0.6, 0.8, 1.0);
            vec3 skyBottom = vec3(0.3, 0.3, 0.4); 
            float t = clamp(0.5 * (ray.direction.y + 1.0), 0.2, 1.0);


            vec3 sky = mix(skyBottom, skyTop, t);

            color += attenuation * sky;
            break;
        }

        if (hit.material == MATERIAL_EMISSIVE) {
            return attenuation * hit.color * lightSphere.intensity;
        }
            
        vec3 lightDir = normalize(lightSphere.center - hit.point);
        float lightDist = length(lightSphere.center - hit.point);

        Ray shadowRay = Ray(hit.point + hit.normal * 0.001, lightDir);
        HitData shadowHit = traceScene(shadowRay, true);

        bool inShadow = false;

        if (shadowHit.hit) {
            if (shadowHit.t < lightDist && shadowHit.material != MATERIAL_EMISSIVE) {
                inShadow = true;
            }
        }

        vec3 diffuse = vec3(0.0);

        if (!inShadow) {
            float NdotL = max(dot(hit.normal, lightDir), 0.0);
            float attenuationFactor = 1.0 / (1.0 + 0.15 * lightDist * lightDist);
            diffuse = hit.color * NdotL * (lightSphere.intensity * u_lightIntensity);
        }

        vec3 ambient = u_ambientStrength * hit.color;

        vec3 directLight  = diffuse;
        vec3 ambientLight = ambient;

       if (hit.material == MATERIAL_DIFFUSE) {
            vec3 baseColor = hit.color * u_objectColor;
            vec3 lighting = (diffuse * baseColor) + (ambientLight * baseColor);
            color += attenuation * lighting;
            break;

            // color = hit.normal * 0.5 + 0.5;
            // break;

            
        }
        else if (hit.material == MATERIAL_VIDEO) {
            vec3 vidColor = texture(u_videoTexture, hit.uv).rgb;
            
            float NdotL = max(dot(hit.normal, lightDir), 0.0);
            float attenuationFactor = 1.0 / (1.0 + 0.15 * lightDist * lightDist);
            vec3 diffuse = vidColor * NdotL * (lightSphere.intensity * u_lightIntensity);
            vec3 ambient = u_ambientStrength * vidColor;

            color += attenuation * (diffuse + ambient);
            break; 
        }  
        else if (hit.material == MATERIAL_REFRACTIVE) {
            float cosTheta = clamp(dot(-ray.direction, hit.normal), 0.0, 1.0);
            float eta = hit.refractiveIndex;
            float k = 1.0 - eta * eta * (1.0 - cosTheta * cosTheta);
            bool total_internal_reflection = (k < 0.0);
            float schlick_value = schlick(cosTheta, eta);
            vec3 direction;

            if (total_internal_reflection || schlick_value > 0.5) {
                direction = reflect(ray.direction, hit.normal);
            } 
            else {
                direction = refraction(ray.direction, hit.normal, eta);
            }

            ray = Ray(hit.point + direction * 0.001, normalize(direction));

            attenuation *= hit.color * 0.98; 
        }
        else if (hit.material == MATERIAL_REFLECTIVE){
            vec3 reflDir = reflect(ray.direction, hit.normal);

            attenuation *= hit.reflectivity * u_reflectionStrength;
            ray = Ray(hit.point + hit.normal * 0.001, normalize(reflDir));
        }else if (hit.material == MATERIAL_CHESSBOARD){
            
            float cosTheta = clamp(dot(-ray.direction, hit.normal), 0.0, 1.0);
            float schlick_value = schlick(cosTheta, 1.25);

            vec3 baseLighting = diffuse * hit.color + ambientLight * hit.color;

            color += attenuation * ((1.0 - schlick_value) * baseLighting);

            vec3 reflDir = reflect(ray.direction, hit.normal);
            ray = Ray(
                hit.point + hit.normal * 0.001,
                normalize(reflDir)
            );

            attenuation *= schlick_value;

            continue;
        }else if(hit.material == MATERIAL_GLASS){
                
            float eta = hit.refractiveIndex;
            float cosTheta = clamp(dot(-ray.direction, hit.normal), 0.0, 1.0);

            float schlick_value = schlick(cosTheta, eta);

            float reflectMix = schlick_value * 0.8;
            float refractMix = 1.0 - reflectMix;

            vec3 refrDir = refraction(ray.direction, hit.normal, eta);

            if (length(refrDir) < 0.001)
            {
                refrDir = reflect(ray.direction, hit.normal);
                reflectMix = 1.0;
                refractMix = 0.0;
            }

            vec3 reflDir = reflect(ray.direction, hit.normal);

            // get colors 
            vec3 reflCol = sampleSky(reflDir);
            vec3 refrCol = mix(reflCol, hit.color, 0.65);

            vec3 finalGlass = reflCol * reflectMix + refrCol * refractMix;

            color += attenuation * finalGlass * hit.color;

            ray = Ray(hit.point + refrDir * 0.001, normalize(refrDir));

            attenuation *= schlick_value;

            continue;
        }

        if (length(attenuation) < 0.01) break;
    }

    return color;
}


void main() {
    
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    float scale = tan(u_fov * 0.5);
    vec3 rd = normalize( u_cameraForward +
        uv.x * scale * u_cameraRight +
        uv.y * scale * u_cameraUp
    );

    Ray ray;
    ray.origin = u_cameraPos;
    ray.direction = rd;

    vec3 color = trace(ray, u_maxBounces);
    color = pow(color, vec3(1.0/2.2));

    fragColor = vec4(color, 1.0);
}
`