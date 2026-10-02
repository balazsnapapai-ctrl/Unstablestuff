/**
 * JVM Classfile Binary Generator (Java 21, Class Version 65.0).
 * Generates binary .class files conforming to the Java Virtual Machine Specification (JVMS 21).
 * Magic: 0xCAFEBABE, Major: 65 (Java 21), Minor: 0.
 */

export interface ClassMethodDef {
  name: string;
  descriptor: string;
  isStatic?: boolean;
}

export interface ClassDef {
  className: string; // e.g. "com/anomalousworld/AnomalousWorldMod"
  superName?: string; // default "java/lang/Object"
  interfaces?: string[]; // e.g. ["net/fabricmc/api/ModInitializer"]
  methods?: ClassMethodDef[];
  fields?: { name: string; descriptor: string; isStatic?: boolean }[];
}

export function generateJava21ClassBytecode(def: ClassDef): Uint8Array {
  const superName = def.superName || 'java/lang/Object';
  const interfaces = def.interfaces || [];
  const methods = def.methods || [];
  const fields = def.fields || [];

  // Constant pool builder
  const cpEntries: { tag: number; bytes: number[] }[] = [];
  const utf8Map = new Map<string, number>();

  function addUtf8(str: string): number {
    if (utf8Map.has(str)) return utf8Map.get(str)!;
    const utf8Bytes = new TextEncoder().encode(str);
    const entryIndex = cpEntries.length + 1;
    const len = utf8Bytes.length;
    const bytes = [1, (len >> 8) & 0xff, len & 0xff, ...Array.from(utf8Bytes)];
    cpEntries.push({ tag: 1, bytes });
    utf8Map.set(str, entryIndex);
    return entryIndex;
  }

  function addClass(name: string): number {
    const nameIndex = addUtf8(name);
    const entryIndex = cpEntries.length + 1;
    cpEntries.push({ tag: 7, bytes: [7, (nameIndex >> 8) & 0xff, nameIndex & 0xff] });
    return entryIndex;
  }

  function addNameAndType(name: string, desc: string): number {
    const nameIdx = addUtf8(name);
    const descIdx = addUtf8(desc);
    const entryIndex = cpEntries.length + 1;
    cpEntries.push({
      tag: 12,
      bytes: [12, (nameIdx >> 8) & 0xff, nameIdx & 0xff, (descIdx >> 8) & 0xff, descIdx & 0xff],
    });
    return entryIndex;
  }

  function addMethodRef(clsName: string, methodName: string, desc: string): number {
    const clsIdx = addClass(clsName);
    const ntIdx = addNameAndType(methodName, desc);
    const entryIndex = cpEntries.length + 1;
    cpEntries.push({
      tag: 10,
      bytes: [10, (clsIdx >> 8) & 0xff, clsIdx & 0xff, (ntIdx >> 8) & 0xff, ntIdx & 0xff],
    });
    return entryIndex;
  }

  // Pre-seed common UTF8 entries
  const codeIdx = addUtf8('Code');
  const thisClassIdx = addClass(def.className);
  const superClassIdx = addClass(superName);

  const ifaceIndices = interfaces.map((iface) => addClass(iface));
  const superInitRef = addMethodRef(superName, '<init>', '()V');

  // Binary stream buffer
  const out: number[] = [];

  // Magic 0xCAFEBABE
  out.push(0xca, 0xfe, 0xba, 0xbe);
  // Minor version 0
  out.push(0x00, 0x00);
  // Major version 65 (Java 21)
  out.push(0x00, 0x41);

  // Constant pool count = cpEntries.length + 1
  const cpCount = cpEntries.length + 1;
  out.push((cpCount >> 8) & 0xff, cpCount & 0xff);

  // Constant pool bytes
  for (const entry of cpEntries) {
    out.push(...entry.bytes);
  }

  // Access flags: ACC_PUBLIC (0x0001) | ACC_SUPER (0x0020)
  out.push(0x00, 0x21);

  // This class & super class
  out.push((thisClassIdx >> 8) & 0xff, thisClassIdx & 0xff);
  out.push((superClassIdx >> 8) & 0xff, superClassIdx & 0xff);

  // Interfaces
  out.push((ifaceIndices.length >> 8) & 0xff, ifaceIndices.length & 0xff);
  for (const ifIdx of ifaceIndices) {
    out.push((ifIdx >> 8) & 0xff, ifIdx & 0xff);
  }

  // Fields
  out.push((fields.length >> 8) & 0xff, fields.length & 0xff);
  for (const f of fields) {
    const fFlags = f.isStatic ? 0x0009 : 0x0001; // PUBLIC [STATIC]
    const fnIdx = addUtf8(f.name);
    const fdIdx = addUtf8(f.descriptor);
    out.push((fFlags >> 8) & 0xff, fFlags & 0xff);
    out.push((fnIdx >> 8) & 0xff, fnIdx & 0xff);
    out.push((fdIdx >> 8) & 0xff, fdIdx & 0xff);
    out.push(0x00, 0x00); // 0 attributes
  }

  // Methods: default constructor + provided methods
  const totalMethodsCount = methods.length + 1; // +1 for <init>
  out.push((totalMethodsCount >> 8) & 0xff, totalMethodsCount & 0xff);

  // 1. Default constructor: public <init>()V
  const initNameIdx = addUtf8('<init>');
  const initDescIdx = addUtf8('()V');
  out.push(0x00, 0x01); // ACC_PUBLIC
  out.push((initNameIdx >> 8) & 0xff, initNameIdx & 0xff);
  out.push((initDescIdx >> 8) & 0xff, initDescIdx & 0xff);
  out.push(0x00, 0x01); // 1 attribute: Code

  // Code attribute for <init>:
  // Bytecode: aload_0 (0x2A), invokespecial super.<init> (0xB7 ...), return (0xB1)
  const initCode = [
    0x2a, // aload_0
    0xb7,
    (superInitRef >> 8) & 0xff,
    superInitRef & 0xff, // invokespecial
    0xb1, // return
  ];
  const initCodeAttrLen = 12 + initCode.length;
  out.push((codeIdx >> 8) & 0xff, codeIdx & 0xff);
  out.push(
    (initCodeAttrLen >> 24) & 0xff,
    (initCodeAttrLen >> 16) & 0xff,
    (initCodeAttrLen >> 8) & 0xff,
    initCodeAttrLen & 0xff
  );
  out.push(0x00, 0x01); // max_stack = 1
  out.push(0x00, 0x01); // max_locals = 1
  out.push(
    (initCode.length >> 24) & 0xff,
    (initCode.length >> 16) & 0xff,
    (initCode.length >> 8) & 0xff,
    initCode.length & 0xff
  );
  out.push(...initCode);
  out.push(0x00, 0x00); // exception_table_length = 0
  out.push(0x00, 0x00); // attributes_count = 0

  // 2. Extra methods
  for (const m of methods) {
    const mFlags = m.isStatic ? 0x0009 : 0x0001; // PUBLIC [STATIC]
    const mnIdx = addUtf8(m.name);
    const mdIdx = addUtf8(m.descriptor);
    out.push((mFlags >> 8) & 0xff, mFlags & 0xff);
    out.push((mnIdx >> 8) & 0xff, mnIdx & 0xff);
    out.push((mdIdx >> 8) & 0xff, mdIdx & 0xff);
    out.push(0x00, 0x01); // 1 attribute: Code

    // Return byte: return (0xB1) or ireturn (0xAC) or areturn (0xB0)
    let retOp = 0xb1; // void return
    if (m.descriptor.endsWith(')Z') || m.descriptor.endsWith(')I')) {
      retOp = 0x04; // iconst_1 then ireturn
    } else if (m.descriptor.endsWith(')D')) {
      retOp = 0x0e; // dconst_0 then dreturn
    }

    const mCode =
      retOp === 0xb1
        ? [0xb1] // return
        : retOp === 0x04
        ? [0x04, 0xac] // iconst_1, ireturn
        : [0x0e, 0xaf]; // dconst_0, dreturn

    const mCodeAttrLen = 12 + mCode.length;
    out.push((codeIdx >> 8) & 0xff, codeIdx & 0xff);
    out.push(
      (mCodeAttrLen >> 24) & 0xff,
      (mCodeAttrLen >> 16) & 0xff,
      (mCodeAttrLen >> 8) & 0xff,
      mCodeAttrLen & 0xff
    );
    out.push(0x00, 0x02); // max_stack = 2
    out.push(0x00, 0x04); // max_locals = 4
    out.push(
      (mCode.length >> 24) & 0xff,
      (mCode.length >> 16) & 0xff,
      (mCode.length >> 8) & 0xff,
      mCode.length & 0xff
    );
    out.push(...mCode);
    out.push(0x00, 0x00); // exception_table_length = 0
    out.push(0x00, 0x00); // attributes_count = 0
  }

  // Class attributes count: 0
  out.push(0x00, 0x00);

  return new Uint8Array(out);
}
