export function linearToGamma(): string {
  const shader = /* wgsl */ `
  fn linearToGamma(linear: vec3<f32>) -> vec3<f32> {
    return pow(linear, vec3<f32>(1.0 / 2.2));
  }
  `;

  return shader;
}

export function gammaToLinear(): string {
  const shader = /* wgsl */ `
  fn gammaToLinear(gamma: vec3<f32>) -> vec3<f32> {
    return pow(gamma, vec3<f32>(2.2));
  }
  `;

  return shader;
}
