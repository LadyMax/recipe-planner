import React, { useMemo, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes.ts";
import { aggregateIngredients } from "../utils/aggregate.ts";
import type { AggregatedItem } from "../utils/aggregate.ts";
const ShoppingListPage: React.FC & { route?: { path: string; index?: number; menuLabel?: string } } = () => {
  const { recipes, loading, error } = useRecipes();
  const [q, setQ] = useState("");

  // 明确标注为 AggregatedItem[]，避免推断问题
  const items: AggregatedItem[] = useMemo(() => {
    const all = aggregateIngredients(recipes);
    const key = q.trim().toLowerCase();
    return key ? all.filter(x => x.name.toLowerCase().includes(key)) : all;
  }, [recipes, q]);

  async function copyToClipboard() {
    const text = items.map(i => {
      const amt = i.amounts.length ? ` [${i.amounts.join(", ")}]` : "";
      const cnt = i.count > 1 ? ` ×${i.count}` : "";
      return `• ${i.name}${amt}${cnt}`;
    }).join("\n");

    // 兜底：navigator.clipboard 不可用时使用旧方案
    try {
      // 某些 TS 环境会对 clipboard 报类型错，这里断言 any 规避
      await (navigator as any).clipboard?.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } finally { document.body.removeChild(ta); }
    }
  }

  if (loading) return <Container className="py-4">Loading…</Container>;
  if (error)   return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-4">
      <Row className="g-2 align-items-end mb-3">
        <Col md={6}>
          <Form.Label>Search</Form.Label>
          <Form.Control
            placeholder="Filter ingredients…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </Col>
        <Col md={6} className="text-md-end">
          <Button className="mt-3 mt-md-0" onClick={copyToClipboard}>Copy list</Button>
        </Col>
      </Row>

      {items.length === 0 ? (
        <Alert variant="secondary">No items.</Alert>
      ) : (
        <ul>
          {items.map(it => (
            <li key={it.name}>
              <strong>{it.name}</strong>
              {it.amounts.length ? <> — <em>{it.amounts.join(", ")}</em></> : null}
              {it.count > 1 ? <> <small>×{it.count}</small></> : null}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

(ShoppingListPage as any).route = {
  path: "/shopping-list",
  menuLabel: "Shopping list",
};

export default ShoppingListPage;
