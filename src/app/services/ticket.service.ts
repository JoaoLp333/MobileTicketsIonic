import { Injectable } from '@angular/core';

export interface Ticket {
  id: string;
  tipo: 'SP' | 'SG' | 'SE';
  dataEmissao: Date;
  dataAtendimento?: Date;
  guiche?: number;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private tickets: Ticket[] = [];
  private filaEspera: Ticket[] = [];
  private ultimasChamadas: Ticket[] = [];
  private contadores = { SP: 1, SG: 1, SE: 1 };

  gerarSenha(tipo: 'SP' | 'SG' | 'SE') {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().slice(2, 10).replace(/-/g, '');
    const seq = this.contadores[tipo].toString().padStart(2, '0');
    
    const novaSenha: Ticket = {
      id: `${dataFormatada}-${tipo}${seq}`,
      tipo,
      dataEmissao: hoje
    };

    this.tickets.push(novaSenha);
    this.filaEspera.push(novaSenha);
    this.contadores[tipo]++;
    return novaSenha;
  }

  chamarProximo(guiche: number) {
    if (this.filaEspera.length === 0) return null;

    // Lógica de prioridade do PDF: SP -> SE/SG -> SP
    let index = this.filaEspera.findIndex(t => t.tipo === 'SP');
    if (index === -1) index = this.filaEspera.findIndex(t => t.tipo === 'SE');
    if (index === -1) index = 0;

    const ticket = this.filaEspera.splice(index, 1)[0];
    ticket.dataAtendimento = new Date();
    ticket.guiche = guiche;

    this.ultimasChamadas.unshift(ticket);
    if (this.ultimasChamadas.length > 5) this.ultimasChamadas.pop();

    return ticket;
  }

  getEstatisticas() {
    return {
      totalEmitido: this.tickets.length,
      totalAtendido: this.tickets.filter(t => t.dataAtendimento).length,
      porTipo: {
        SP: this.tickets.filter(t => t.tipo === 'SP').length,
        SG: this.tickets.filter(t => t.tipo === 'SG').length,
        SE: this.tickets.filter(t => t.tipo === 'SE').length,
      }
    };
  }

  getHistorico() { return this.tickets; }
  getUltimasCinco() { return this.ultimasChamadas; }
}