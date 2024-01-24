export function diffuseLambertian(): string {
  const shader = /* wgsl */ `
  fn diffuseLambertian(
    normal: vec3<f32>,
    lightDirection: vec3<f32>,
    lightColor: vec3<f32>,
  ) -> vec3<f32> {

    let diffuseFactor = max(dot(normal, lightDirection), 0.0);
    return diffuseFactor * lightColor;
  }
  `;

  return shader;
}

export function diffuseOrenNayar(): string {
  const shader = /* wgsl */ `
  fn diffuseOrenNayar(
    normal: vec3<f32>,
    // vector from the surface point to the light
    lightDirection: vec3<f32>,
    // vector from the surface point to the camera
    camDirection: vec3<f32>,
    lightColor: vec3<f32>,
    roughness: f32,
  ) -> vec3<f32> {

    let NV = clamp(dot(normal, camDirection), 0.0, 1.0);
    let NL = clamp(dot(normal, lightDirection), 0.0, 1.0);

    let angleNV = acos(NV);
    let angleNL = acos(NL);

    let alpha = max(angleNV, angleNL);
    let beta = min(angleNV, angleNL);
    let gamma = cos(angleNV - angleNL);
    let roughnessSq = roughness * roughness;

    let A = 1.0 - 0.5 * (roughnessSq / (roughnessSq + 0.57));
    let B = 0.45 * (roughnessSq / (roughnessSq + 0.09));
    let C = sin(alpha) * tan(beta);

    let diffuseFactor = NL * (A + B * max(0.0, gamma) * C);

    return diffuseFactor * lightColor;
  }
  `;

  return shader;
}
